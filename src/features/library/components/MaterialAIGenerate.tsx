"use client";

import { useState } from "react";

import { Badge, Button, Card, Icon } from "@/components/ui";
import { generateQuestions, generateDraftImage, type DraftQuestion } from "../api/libraryApi";
import type { MaterialDetail } from "../api/libraryApi";
import type { QuestionFormValue } from "./QuestionForm";

const inputCls =
  "w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15";

function draftToValue(d: DraftQuestion): QuestionFormValue {
  return { ...d, points: 5, imageData: d.imageData ?? null, imagePrompt: d.imagePrompt ?? null };
}

interface Props {
  material: MaterialDetail;
  onReviewDraft: (value: QuestionFormValue, draftIndex: number) => void;
}

export function MaterialAIGenerate({ material, onReviewDraft }: Props) {
  const [count, setCount] = useState("5");
  const [difficulty, setDifficulty] = useState("");
  const [instructions, setInstructions] = useState("");
  const [includeImages, setIncludeImages] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<DraftQuestion[]>([]);
  const [draftImageLoading, setDraftImageLoading] = useState<number | null>(null);

  async function onGenerate() {
    setGenError(null);
    setGenerating(true);
    try {
      const res = await generateQuestions(material.id, {
        count: Math.min(10, Math.max(1, Number(count) || 5)),
        difficulty: difficulty ? Number(difficulty) : undefined,
        instructions: instructions.trim() || undefined,
        includeImages: includeImages || undefined,
      });
      setDrafts(res.drafts);
      if (res.drafts.length === 0) setGenError("생성된 초안이 없습니다. 지시를 바꿔 다시 시도하세요.");
    } catch (e) {
      setGenError(e instanceof Error ? e.message : "AI 생성에 실패했습니다.");
    } finally {
      setGenerating(false);
    }
  }

  function handleReviewDraft(d: DraftQuestion, i: number) {
    onReviewDraft(draftToValue(d), i);
  }

  /** Called by parent after a draft is saved successfully */
  function removeDraft(index: number) {
    setDrafts((prev) => prev.filter((_, i) => i !== index));
  }

  // Expose removeDraft via a ref-like pattern isn't needed since parent handles via callback
  // We use a key prop approach: parent calls onReviewDraft, and we expose removeDraft
  // Actually, let's expose it by attaching to the component's returned object — simpler:
  // We'll just handle it via the discard button and let parent track the fromDraft index

  return (
    <>
      {/* AI 생성 패널 */}
      <Card className="flex flex-col gap-3">
        <p className="font-bold text-ink">AI 문제 생성</p>
        <p className="text-xs text-ink-faint">
          등록된 AI 연동으로 초안을 생성합니다. 초안은 저장 전이며, 검수 후 저장합니다.
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
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={includeImages}
            onChange={(e) => setIncludeImages(e.target.checked)}
            className="h-4 w-4 rounded border-line accent-primary-500"
          />
          <span className="text-xs font-medium text-ink-muted">AI 이미지도 함께 생성</span>
        </label>
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
            <Card key={i} className="flex flex-col gap-2">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-1.5">
                    <Badge tone="primary">{d.type === "situational" ? "상황형" : "객관식"}</Badge>
                    <Badge tone="slate">Lv.{d.difficulty}</Badge>
                    {d.imageData && <Badge tone="green">이미지</Badge>}
                  </div>
                  <p className="line-clamp-2 text-sm text-ink">{d.question}</p>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <Button
                    size="sm"
                    onClick={() => handleReviewDraft(d, i)}
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
              </div>
              {/* 초안 이미지 영역 */}
              <div className="flex items-start gap-2 border-t border-line/30 pt-2">
                {d.imageData ? (
                  <div className="relative shrink-0">
                    <img
                      src={d.imageData.startsWith("data:") ? d.imageData : `data:image/png;base64,${d.imageData}`}
                      alt=""
                      className="h-20 w-20 rounded-lg border border-line object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setDrafts((prev) => prev.map((dd, idx) =>
                        idx === i ? { ...dd, imageData: null, imagePrompt: null } : dd
                      ))}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-surface-2 text-ink-faint ring-1 ring-line hover:text-red-400"
                      title="이미지 제거"
                    >
                      <Icon name="x" size={12} />
                    </button>
                  </div>
                ) : null}
                <Button
                  variant="ghost"
                  size="sm"
                  loading={draftImageLoading === i}
                  onClick={async () => {
                    setDraftImageLoading(i);
                    try {
                      const img = await generateDraftImage({
                        type: d.type,
                        situation: d.situation,
                        question: d.question,
                        materialTitle: material.title,
                      });
                      setDrafts((prev) => prev.map((dd, idx) =>
                        idx === i ? { ...dd, imageData: img.imageData, imagePrompt: img.imagePrompt } : dd
                      ));
                    } catch { /* ignore */ }
                    finally { setDraftImageLoading(null); }
                  }}
                >
                  <Icon name="cpu" size={14} />
                  {d.imageData ? "이미지 재생성" : "이미지 생성"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
