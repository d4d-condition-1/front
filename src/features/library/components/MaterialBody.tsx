"use client";

import { useState } from "react";

import { Badge, Button, Card, Icon } from "@/components/ui";
import { uploadPdf, deletePdf } from "../api/libraryApi";
import type { MaterialDetail } from "../api/libraryApi";

const inputCls =
  "w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15";

interface Props {
  material: MaterialDetail;
  onSaveBody: (body: string) => Promise<void>;
  onMaterialUpdated: (m: MaterialDetail) => void;
}

export function MaterialBody({ material, onSaveBody, onMaterialUpdated }: Props) {
  const [bodyDraft, setBodyDraft] = useState<string | null>(null);
  const [savingBody, setSavingBody] = useState(false);

  // PDF
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const bodyValue = bodyDraft ?? material.body;
  const bodyDirty = bodyDraft != null && bodyDraft !== material.body;

  async function handleSaveBody() {
    if (bodyDraft == null) return;
    setSavingBody(true);
    try {
      await onSaveBody(bodyDraft);
      setBodyDraft(null);
    } finally {
      setSavingBody(false);
    }
  }

  async function handleUploadPdf(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 30 * 1024 * 1024) {
      setPdfError("PDF 파일은 30MB 이하여야 합니다.");
      return;
    }
    setPdfError(null);
    setUploadingPdf(true);
    try {
      const updated = await uploadPdf(material.id, file);
      onMaterialUpdated(updated);
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : "PDF 업로드에 실패했습니다.");
    } finally {
      setUploadingPdf(false);
      e.target.value = "";
    }
  }

  async function handleDeletePdf() {
    if (!confirm("첨부된 PDF를 삭제할까요?")) return;
    try {
      const updated = await deletePdf(material.id);
      onMaterialUpdated(updated);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      {/* 본문 */}
      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="font-bold text-ink">자료 본문</p>
          <Badge tone={material.hasBody ? "green" : "amber"}>
            {material.hasBody ? "본문 있음" : "본문 없음"}
          </Badge>
        </div>
        <p className="text-xs text-ink-faint">
          AI 는 이 본문만을 근거로 문제를 생성합니다. 교범 텍스트를 붙여넣으세요.
        </p>
        <textarea
          value={bodyValue}
          onChange={(e) => setBodyDraft(e.target.value)}
          placeholder="교범 본문을 붙여넣으세요..."
          rows={10}
          className={`${inputCls} resize-y font-mono text-[13px] leading-relaxed`}
        />
        <Button onClick={handleSaveBody} loading={savingBody} disabled={!bodyDirty} className="self-start">
          본문 저장
        </Button>
      </Card>

      {/* PDF 업로드 */}
      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="font-bold text-ink">PDF 첨부</p>
          <Badge tone={material.hasPdf ? "green" : "slate"}>
            {material.hasPdf ? "첨부됨" : "없음"}
          </Badge>
        </div>
        <p className="text-xs text-ink-faint">
          Anthropic·Google 연동은 PDF를 직접 읽어 문제를 생성합니다. 본문이 없어도 PDF만으로
          생성 가능합니다.
        </p>
        {material.hasPdf && (
          <div className="flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2 text-xs">
            <span className="min-w-0 truncate text-ink">{material.pdfFilename ?? "PDF 파일"}</span>
            <button
              onClick={handleDeletePdf}
              className="ml-auto shrink-0 text-ink-faint hover:text-red-400"
            >
              삭제
            </button>
          </div>
        )}
        {pdfError && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300">
            {pdfError}
          </p>
        )}
        <label className={`cursor-pointer self-start ${uploadingPdf ? "pointer-events-none opacity-50" : ""}`}>
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface-2 px-3 py-2 text-sm font-medium text-ink hover:bg-surface">
            {uploadingPdf ? "업로드 중..." : material.hasPdf ? "PDF 교체" : "PDF 업로드"}
          </span>
          <input
            type="file"
            accept=".pdf,application/pdf"
            className="sr-only"
            onChange={handleUploadPdf}
            disabled={uploadingPdf}
          />
        </label>
      </Card>
    </>
  );
}
