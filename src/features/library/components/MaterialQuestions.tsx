"use client";

import { useState } from "react";

import { Badge, Button, Card, Icon, Spinner } from "@/components/ui";
import type { AdminQuestion } from "../api/questionApi";
import type { QuestionFormValue } from "./QuestionForm";

interface Props {
  questions: AdminQuestion[];
  onEdit: (value: QuestionFormValue, editingId: string) => void;
  onToggle: (q: AdminQuestion) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  onGenImagePreview: (qid: string, prompt?: string) => Promise<{ imageData: string; imagePrompt: string }>;
  onConfirmImage: (qid: string, imageData: string, imagePrompt: string) => Promise<unknown>;
  onRemoveImage: (qid: string) => Promise<void>;
  onEditImage: (qid: string, instruction: string) => Promise<unknown>;
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
    imageData: q.imageData ?? null,
    imagePrompt: q.imagePrompt ?? null,
  };
}

export function MaterialQuestions({
  questions,
  onEdit,
  onToggle,
  onRemove,
  onGenImagePreview,
  onConfirmImage,
  onRemoveImage,
  onEditImage,
}: Props) {
  const [generatingImageId, setGeneratingImageId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<{ qid: string; imageData: string; imagePrompt: string } | null>(null);
  const [applyingImage, setApplyingImage] = useState(false);
  const [imagePrompts, setImagePrompts] = useState<Record<string, string>>({});
  const [mediaError, setMediaError] = useState<string | null>(null);

  return (
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
              className="flex flex-col gap-2 border-b border-line/60 px-5 py-3 last:border-0"
            >
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-1.5">
                    <Badge tone="slate">Lv.{q.difficulty}</Badge>
                    <Badge tone={q.active ? "green" : "slate"}>
                      {q.active ? "활성" : "비활성"}
                    </Badge>
                    {q.hasImage && <Badge tone="primary">이미지</Badge>}
                    {q.hasVideo && <Badge tone="amber">영상</Badge>}
                  </div>
                  <p className="line-clamp-2 text-sm text-ink">{q.question}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(questionToValue(q), q.id)}
                  >
                    수정
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onToggle(q)}>
                    {q.active ? "비활성" : "활성"}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      if (confirm("이 문제를 삭제할까요? (답안 이력이 있으면 비활성화됩니다)"))
                        onRemove(q.id);
                    }}
                  >
                    삭제
                  </Button>
                </div>
              </div>
              {/* 이미지 영역 */}
              <div className="flex flex-col gap-2 border-t border-line/50 pt-2">
                {mediaError && generatingImageId === q.id && (
                  <p className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-300">{mediaError}</p>
                )}

                {generatingImageId === q.id && (
                  <div className="flex items-center gap-2 rounded-lg bg-primary-500/10 px-3 py-1.5 text-xs text-primary-300">
                    <Spinner size={14} /> AI 이미지 생성 중...
                  </div>
                )}

                <div className="flex items-start gap-3">
                  {q.hasImage && q.imageData && imagePreview?.qid !== q.id && (
                    <img
                      src={`data:image/png;base64,${q.imageData}`}
                      alt="문제 이미지"
                      className="h-28 w-28 shrink-0 rounded-lg border border-line object-cover"
                    />
                  )}
                  {imagePreview?.qid === q.id && (
                    <div className="relative shrink-0">
                      <img
                        src={imagePreview.imageData.startsWith("data:") ? imagePreview.imageData : `data:image/png;base64,${imagePreview.imageData}`}
                        alt="미리보기"
                        className="h-28 w-28 rounded-lg border-2 border-primary-500 object-cover"
                      />
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded bg-primary-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        미리보기
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <input
                        value={imagePrompts[q.id] ?? ""}
                        onChange={(e) => { setImagePrompts((p) => ({ ...p, [q.id]: e.target.value })); setMediaError(null); }}
                        placeholder={q.hasImage ? "수정 지시 (예: 배경을 숲으로)" : "이미지 프롬프트 (비우면 자동 생성)"}
                        className="w-52 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs text-ink outline-none focus:border-primary-500"
                        disabled={generatingImageId === q.id}
                        onKeyDown={(e) => {
                          if (e.key !== "Enter" || generatingImageId === q.id) return;
                          e.preventDefault();
                          const prompt = (imagePrompts[q.id] ?? "").trim();
                          (async () => {
                            setGeneratingImageId(q.id);
                            setMediaError(null);
                            try {
                              if (q.hasImage && prompt && !imagePreview) {
                                await onEditImage(q.id, prompt);
                                setImagePrompts((p) => ({ ...p, [q.id]: "" }));
                              } else {
                                const preview = await onGenImagePreview(q.id, prompt || undefined);
                                setImagePreview({ qid: q.id, ...preview });
                              }
                            } catch (err) { setMediaError(err instanceof Error ? err.message : "이미지 생성 실패"); }
                            finally { setGeneratingImageId(null); }
                          })();
                        }}
                      />
                      {imagePreview?.qid === q.id ? (
                        <>
                          <Button
                            size="sm"
                            loading={applyingImage}
                            onClick={async () => {
                              setApplyingImage(true);
                              setMediaError(null);
                              try {
                                await onConfirmImage(q.id, imagePreview.imageData, imagePreview.imagePrompt);
                                setImagePreview(null);
                                setImagePrompts((p) => ({ ...p, [q.id]: "" }));
                              } catch (err) { setMediaError(err instanceof Error ? err.message : "적용 실패"); }
                              finally { setApplyingImage(false); }
                            }}
                          >
                            적용
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            loading={generatingImageId === q.id}
                            onClick={async () => {
                              const prompt = (imagePrompts[q.id] ?? "").trim();
                              setGeneratingImageId(q.id);
                              setMediaError(null);
                              try {
                                const preview = await onGenImagePreview(q.id, prompt || undefined);
                                setImagePreview({ qid: q.id, ...preview });
                              } catch (err) { setMediaError(err instanceof Error ? err.message : "이미지 생성 실패"); }
                              finally { setGeneratingImageId(null); }
                            }}
                          >
                            <Icon name="cpu" size={14} /> 다시 생성
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => { setImagePreview(null); setMediaError(null); }}>
                            취소
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            loading={generatingImageId === q.id}
                            onClick={async () => {
                              const prompt = (imagePrompts[q.id] ?? "").trim();
                              setGeneratingImageId(q.id);
                              setMediaError(null);
                              try {
                                if (q.hasImage && prompt) {
                                  await onEditImage(q.id, prompt);
                                  setImagePrompts((p) => ({ ...p, [q.id]: "" }));
                                } else {
                                  const preview = await onGenImagePreview(q.id, prompt || undefined);
                                  setImagePreview({ qid: q.id, ...preview });
                                }
                              } catch (err) { setMediaError(err instanceof Error ? err.message : "이미지 생성 실패"); }
                              finally { setGeneratingImageId(null); }
                            }}
                          >
                            <Icon name="cpu" size={14} />
                            {q.hasImage && (imagePrompts[q.id] ?? "").trim() ? "수정" : q.hasImage ? "재생성" : "이미지 생성"}
                          </Button>
                          {q.hasImage && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (confirm("이미지를 삭제할까요?")) onRemoveImage(q.id);
                              }}
                            >
                              삭제
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
