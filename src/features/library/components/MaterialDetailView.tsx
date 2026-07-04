"use client";

import { useState } from "react";
import Link from "next/link";

import { Badge, Button, Card, Icon, Spinner } from "@/components/ui";
import { getCategory } from "@/features/categories";
import { useMaterialHub } from "../hooks/useMaterialHub";
import { generateQuestions, uploadPdf, deletePdf, type DraftQuestion } from "../api/libraryApi";
import type { AdminQuestion } from "../api/questionApi";
import { EMPTY_QUESTION, QuestionForm, type QuestionFormValue } from "./QuestionForm";

const inputCls =
  "w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15";

interface Editing {
  value: QuestionFormValue;
  editingId?: string;
  fromDraft?: number; // 초안에서 온 경우 그 인덱스 (저장 후 제거용)
}

function draftToValue(d: DraftQuestion): QuestionFormValue {
  return { ...d, points: 5 };
}
function questionToValue(q: AdminQuestion): QuestionFormValue {
  return {
    type: q.type,
    difficulty: q.difficulty,
    situation: q.situation,
    question: q.question,
    options: q.options,
    answerIndex: q.answerIndex,
    explanation: q.explanation,
    reference: q.reference,
    points: q.points,
  };
}

export function MaterialDetailView({ materialId }: { materialId: string }) {
  const hub = useMaterialHub(materialId);
  const { material, questions } = hub;

  // 본문 편집
  const [bodyDraft, setBodyDraft] = useState<string | null>(null);
  const [savingBody, setSavingBody] = useState(false);

  // PDF 업로드
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // AI 생성
  const [count, setCount] = useState("5");
  const [difficulty, setDifficulty] = useState("");
  const [instructions, setInstructions] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<DraftQuestion[]>([]);

  // 편집 폼
  const [editing, setEditing] = useState<Editing | null>(null);

  if (hub.loading) {
    return (
      <div className="grid flex-1 place-items-center py-24 text-primary-500">
        <Spinner size={28} />
      </div>
    );
  }
  if (hub.error || !material) {
    return (
      <div className="grid flex-1 place-items-center px-8 py-24 text-center text-sm text-ink-muted">
        {hub.error ?? "자료를 찾을 수 없습니다."}
      </div>
    );
  }

  const cat = getCategory(material.category);
  const bodyValue = bodyDraft ?? material.body;
  const bodyDirty = bodyDraft != null && bodyDraft !== material.body;

  async function onUploadPdf(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 30 * 1024 * 1024) {
      setPdfError("PDF 파일은 30MB 이하여야 합니다.");
      return;
    }
    setPdfError(null);
    setUploadingPdf(true);
    try {
      const updated = await uploadPdf(material!.id, file);
      hub.updateMaterial(updated);
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : "PDF 업로드에 실패했습니다.");
    } finally {
      setUploadingPdf(false);
      e.target.value = "";
    }
  }

  async function onDeletePdf() {
    if (!confirm("첨부된 PDF를 삭제할까요?")) return;
    try {
      const updated = await deletePdf(material!.id);
      hub.updateMaterial(updated);
    } catch {
      /* ignore */
    }
  }

  async function onSaveBody() {
    if (bodyDraft == null) return;
    setSavingBody(true);
    try {
      await hub.saveBody(bodyDraft);
      setBodyDraft(null);
    } finally {
      setSavingBody(false);
    }
  }

  async function onGenerate() {
    setGenError(null);
    setGenerating(true);
    try {
      const res = await generateQuestions(material!.id, {
        count: Math.min(10, Math.max(1, Number(count) || 5)),
        difficulty: difficulty ? Number(difficulty) : undefined,
        instructions: instructions.trim() || undefined,
      });
      setDrafts(res.drafts);
      if (res.drafts.length === 0) setGenError("생성된 초안이 없습니다. 지시를 바꿔 다시 시도하세요.");
    } catch (e) {
      setGenError(e instanceof Error ? e.message : "AI 생성에 실패했습니다.");
    } finally {
      setGenerating(false);
    }
  }

  async function onSaveQuestion(input: Parameters<typeof hub.saveQuestion>[0], editingId?: string) {
    await hub.saveQuestion(input, editingId);
    // 초안에서 온 저장이면 해당 초안 제거
    if (editing?.fromDraft != null) {
      const idx = editing.fromDraft;
      setDrafts((prev) => prev.filter((_, i) => i !== idx));
    }
    setEditing(null);
  }

  return (
    <div className="flex flex-col gap-5 p-6 md:p-8">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <Link href="/admin/materials" className="text-ink-faint hover:text-ink">
          <Icon name="chevronLeft" size={22} />
        </Link>
        <div
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[11px] font-bold text-white"
          style={{ backgroundColor: cat.color }}
        >
          {material.category}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold text-ink">{material.title}</h1>
          <p className="text-xs text-ink-faint">
            {cat.name} · {material.pages}페이지 · {questions.length}개 문제
          </p>
        </div>
        <Badge tone={material.isActive ? "green" : "slate"} className="ml-auto">
          {material.isActive ? "활성" : "비활성"}
        </Badge>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* 좌: 본문 + AI 생성 */}
        <div className="flex flex-col gap-5">
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
            <Button onClick={onSaveBody} loading={savingBody} disabled={!bodyDirty} className="self-start">
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
                  onClick={onDeletePdf}
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
                onChange={onUploadPdf}
                disabled={uploadingPdf}
              />
            </label>
          </Card>

          {/* AI 생성 패널 */}
          <Card className="flex flex-col gap-3">
            <p className="font-bold text-ink">AI 문제 생성</p>
            <p className="text-xs text-ink-faint">
              등록된 Anthropic 연동으로 초안을 뽑습니다. 초안은 저장 전이며, 검수 후 저장합니다.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-ink-muted">문항 수 (1~10)</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  className={inputCls}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-ink-muted">목표 난이도</span>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className={inputCls}
                >
                  <option value="">자동</option>
                  {[1, 2, 3, 4, 5].map((d) => (
                    <option key={d} value={d}>
                      Lv.{d}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="추가 지시 (선택) — 예: 상황형 위주로, 지형 판독 중심으로"
              rows={2}
              className={inputCls}
            />
            {genError && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300">
                {genError}
              </p>
            )}
            <Button variant="signal" onClick={onGenerate} loading={generating} disabled={!material.hasBody && !material.hasPdf}>
              <Icon name="cpu" size={18} /> AI로 문제 생성
            </Button>
            {!material.hasBody && !material.hasPdf && (
              <p className="text-xs text-amber-300">본문 또는 PDF를 먼저 등록해야 생성할 수 있습니다.</p>
            )}
          </Card>

          {/* 초안 카드 */}
          {drafts.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-bold text-ink">AI 초안 {drafts.length}개</p>
              {drafts.map((d, i) => (
                <Card key={i} className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-1.5">
                      <Badge tone="primary">{d.type === "situational" ? "상황형" : "객관식"}</Badge>
                      <Badge tone="slate">Lv.{d.difficulty}</Badge>
                    </div>
                    <p className="line-clamp-2 text-sm text-ink">{d.question}</p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    <Button
                      size="sm"
                      onClick={() => setEditing({ value: draftToValue(d), fromDraft: i })}
                    >
                      검수
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDrafts((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      버리기
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* 우: 편집 폼 + 문제 목록 */}
        <div className="flex flex-col gap-5">
          {editing ? (
            <QuestionForm
              key={editing.editingId ?? `draft-${editing.fromDraft}-${drafts.length}`}
              materialId={material.id}
              categoryName={cat.name}
              initial={editing.value}
              editingId={editing.editingId}
              onSave={onSaveQuestion}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <Button
              variant="secondary"
              onClick={() => setEditing({ value: { ...EMPTY_QUESTION } })}
              className="self-start"
            >
              <Icon name="plus" size={16} /> 문제 직접 추가
            </Button>
          )}

          {/* 이 자료의 문제 목록 */}
          <Card className="flex flex-col gap-2 p-0">
            <p className="border-b border-line px-5 py-4 text-sm font-bold text-ink">
              이 자료의 문제 ({questions.length})
            </p>
            {questions.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-ink-faint">
                아직 문제가 없습니다. AI로 생성하거나 직접 추가하세요.
              </p>
            ) : (
              <ul>
                {questions.map((q) => (
                  <li
                    key={q.id}
                    className="flex items-start gap-3 border-b border-line/60 px-5 py-3 last:border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-1.5">
                        <Badge tone="slate">Lv.{q.difficulty}</Badge>
                        <Badge tone={q.active ? "green" : "slate"}>
                          {q.active ? "활성" : "비활성"}
                        </Badge>
                      </div>
                      <p className="line-clamp-2 text-sm text-ink">{q.question}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditing({ value: questionToValue(q), editingId: q.id })}
                      >
                        수정
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => hub.toggleQuestion(q)}>
                        {q.active ? "비활성" : "활성"}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          if (confirm("이 문제를 삭제할까요? (답안 이력이 있으면 비활성화됩니다)"))
                            hub.removeQuestion(q.id);
                        }}
                      >
                        삭제
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
