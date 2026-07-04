"use client";

import { useState } from "react";

import { Button, Icon } from "@/components/ui";
import type { QType, QuestionInput } from "../api/questionApi";

const inputCls =
  "w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15";

export interface QuestionFormValue {
  type: QType;
  difficulty: number;
  situation: string | null;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  reference: string;
  points: number;
  imageData?: string | null;
  imagePrompt?: string | null;
}

export const EMPTY_QUESTION: QuestionFormValue = {
  type: "multiple_choice",
  difficulty: 3,
  situation: null,
  question: "",
  options: ["", "", "", ""],
  answerIndex: 0,
  explanation: "",
  reference: "",
  points: 5,
};

interface Props {
  materialId: string;
  categoryName: string;
  initial: QuestionFormValue;
  editingId?: string;
  onSave: (input: QuestionInput, editingId?: string) => Promise<void>;
  onCancel: () => void;
}

/** 문제 검수·커스텀 폼. AI 초안 또는 기존 문제를 채워 저장한다. 카테고리는 자료를 따른다. */
export function QuestionForm({ materialId, categoryName, initial, editingId, onSave, onCancel }: Props) {
  const [v, setV] = useState<QuestionFormValue>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function patch(p: Partial<QuestionFormValue>) {
    setV((prev) => ({ ...prev, ...p }));
  }
  function setOption(i: number, text: string) {
    setV((prev) => ({ ...prev, options: prev.options.map((o, idx) => (idx === i ? text : o)) }));
  }
  function addOption() {
    if (v.options.length >= 6) return;
    setV((prev) => ({ ...prev, options: [...prev.options, ""] }));
  }
  function removeOption(i: number) {
    if (v.options.length <= 2) return;
    setV((prev) => {
      const options = prev.options.filter((_, idx) => idx !== i);
      let answerIndex = prev.answerIndex;
      if (i === answerIndex) answerIndex = 0;
      else if (i < answerIndex) answerIndex -= 1;
      return { ...prev, options, answerIndex };
    });
  }

  async function onSubmit() {
    setError(null);
    const options = v.options.map((o) => o.trim()).filter(Boolean);
    if (!v.question.trim()) return setError("문제를 입력하세요.");
    if (options.length < 2) return setError("선택지는 2개 이상이어야 합니다.");
    if (v.answerIndex < 0 || v.answerIndex >= options.length) return setError("정답을 선택하세요.");

    setSaving(true);
    try {
      await onSave(
        {
          materialId,
          type: v.type,
          situation: v.type === "situational" ? (v.situation?.trim() || null) : null,
          question: v.question.trim(),
          options,
          answerIndex: v.answerIndex,
          difficulty: v.difficulty,
          points: v.points,
          explanation: v.explanation.trim(),
          reference: v.reference.trim(),
          imageData: v.imageData ?? null,
          imagePrompt: v.imagePrompt ?? null,
        },
        editingId,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장에 실패했습니다.");
      setSaving(false);
      return;
    }
    setSaving(false);
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-primary-500/30 bg-surface p-4">
      <div className="flex items-center justify-between">
        <p className="font-bold text-ink">
          {editingId ? "문제 수정" : "문제 검수 · 저장"}
        </p>
        <span className="rounded-md bg-surface-2 px-2 py-0.5 text-xs text-ink-muted">
          {categoryName}
        </span>
      </div>

      {/* 유형 */}
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-surface-2 p-1">
        {(["multiple_choice", "situational"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => patch({ type: t })}
            className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
              v.type === t ? "bg-surface text-primary-300 ring-1 ring-line" : "text-ink-muted"
            }`}
          >
            {t === "multiple_choice" ? "객관식" : "상황형"}
          </button>
        ))}
      </div>

      {v.type === "situational" && (
        <textarea
          value={v.situation ?? ""}
          onChange={(e) => patch({ situation: e.target.value })}
          placeholder="상황 설명 (예: 당신은 소대 2분대장입니다...)"
          rows={3}
          className={inputCls}
        />
      )}

      <textarea
        value={v.question}
        onChange={(e) => patch({ question: e.target.value })}
        placeholder="질문"
        rows={2}
        className={inputCls}
      />

      {/* 선택지 + 정답 라디오 */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-ink-muted">
          선택지 (정답을 라디오로 선택)
        </span>
        {v.options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="radio"
              name="answer"
              checked={v.answerIndex === i}
              onChange={() => patch({ answerIndex: i })}
              className="h-4 w-4 accent-primary-500"
              aria-label={`${i + 1}번을 정답으로`}
            />
            <input
              value={opt}
              onChange={(e) => setOption(i, e.target.value)}
              placeholder={`선택지 ${i + 1}`}
              className={inputCls}
            />
            {v.options.length > 2 && (
              <button
                type="button"
                onClick={() => removeOption(i)}
                className="text-ink-faint hover:text-red-400"
                aria-label="선택지 삭제"
              >
                <Icon name="x" size={16} />
              </button>
            )}
          </div>
        ))}
        {v.options.length < 6 && (
          <button
            type="button"
            onClick={addOption}
            className="flex items-center gap-1 self-start text-xs font-semibold text-primary-400"
          >
            <Icon name="plus" size={14} /> 선택지 추가
          </button>
        )}
      </div>

      {/* 난이도 · 배점 */}
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-ink-muted">난이도 (1~5)</span>
          <select
            value={v.difficulty}
            onChange={(e) => patch({ difficulty: Number(e.target.value) })}
            className={inputCls}
          >
            {[1, 2, 3, 4, 5].map((d) => (
              <option key={d} value={d}>
                Lv.{d}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-ink-muted">배점</span>
          <input
            type="number"
            min={1}
            value={v.points}
            onChange={(e) => patch({ points: Math.max(1, Number(e.target.value) || 1) })}
            className={inputCls}
          />
        </label>
      </div>

      <textarea
        value={v.explanation}
        onChange={(e) => patch({ explanation: e.target.value })}
        placeholder="해설"
        rows={2}
        className={inputCls}
      />
      <input
        value={v.reference}
        onChange={(e) => patch({ reference: e.target.value })}
        placeholder="출처 (예: FM 7-8, 3장)"
        className={inputCls}
      />

      {/* 이미지 첨부 */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-ink-muted">문제 이미지</span>
        {v.imageData ? (
          <div className="relative inline-block self-start">
            <img
              src={v.imageData.startsWith("data:") ? v.imageData : `data:image/png;base64,${v.imageData}`}
              alt="문제 이미지"
              className="h-36 w-36 rounded-lg border border-line object-cover"
            />
            <button
              type="button"
              onClick={() => patch({ imageData: null, imagePrompt: null })}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-surface-2 ring-1 ring-line text-ink-faint hover:text-red-400"
              title="이미지 제거"
            >
              <Icon name="x" size={14} />
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer items-center gap-2 self-start rounded-lg border border-dashed border-line px-4 py-3 text-xs text-ink-muted hover:border-primary-500 hover:text-primary-400 transition-colors">
            <Icon name="upload" size={16} />
            이미지 첨부
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  const result = reader.result as string;
                  patch({ imageData: result, imagePrompt: null });
                };
                reader.readAsDataURL(file);
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300">{error}</p>
      )}

      <div className="flex gap-2">
        <Button onClick={onSubmit} loading={saving} className="flex-1">
          {editingId ? "수정 저장" : "문제 은행에 저장"}
        </Button>
        <Button variant="secondary" onClick={onCancel} disabled={saving}>
          취소
        </Button>
      </div>
    </div>
  );
}
