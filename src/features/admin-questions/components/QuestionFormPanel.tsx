"use client";

import { type FormEvent, useEffect, useState } from "react";

import { Button, Card, Icon } from "@/components/ui";
import { CATEGORIES, type CategoryCode } from "@/features/categories";
import { fetchLibrary, type LibraryItem } from "@/features/library";
import type { AdminQuestion, QType, QuestionInput } from "../api/questionApi";

const inputCls =
  "w-full rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:opacity-60";
const labelCls = "text-xs font-medium text-ink-muted";

interface FormState {
  materialId: string;
  category: CategoryCode;
  type: QType;
  situation: string;
  question: string;
  options: string[];
  answerIndex: number;
  difficulty: number;
  points: number;
  explanation: string;
  reference: string;
}

const emptyForm: FormState = {
  materialId: "",
  category: "TAC",
  type: "multiple_choice",
  situation: "",
  question: "",
  options: ["", ""],
  answerIndex: 0,
  difficulty: 3,
  points: 5,
  explanation: "",
  reference: "",
};

function toForm(q: AdminQuestion): FormState {
  return {
    materialId: q.materialId ?? "",
    category: q.category,
    type: q.type,
    situation: q.situation ?? "",
    question: q.question,
    options: [...q.options],
    answerIndex: q.answerIndex,
    difficulty: q.difficulty,
    points: q.points,
    explanation: q.explanation,
    reference: q.reference,
  };
}

interface Props {
  editingQuestion: AdminQuestion | null;
  onSave: (input: QuestionInput, editingId?: string) => Promise<void>;
  onCancelEdit: () => void;
}

export function QuestionFormPanel({ editingQuestion, onSave, onCancelEdit }: Props) {
  const [materials, setMaterials] = useState<LibraryItem[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchLibrary()
      .then((data) => active && setMaterials(data))
      .catch(() => {});
    return () => { active = false; };
  }, []);

  // Sync form when editingQuestion changes
  useEffect(() => {
    if (editingQuestion) {
      setForm(toForm(editingQuestion));
      setFormError(null);
    } else {
      setForm(emptyForm);
      setFormError(null);
    }
  }, [editingQuestion]);

  const selectedMaterial = materials.find((m) => m.id === form.materialId) ?? null;
  const effectiveCategory = selectedMaterial?.category ?? form.category;

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onMaterialChange(id: string) {
    const mat = materials.find((m) => m.id === id) ?? null;
    setForm((f) => ({
      ...f,
      materialId: id,
      category: mat ? mat.category : f.category,
    }));
  }

  function resetForm() {
    onCancelEdit();
    setForm(emptyForm);
    setFormError(null);
  }

  function setOption(i: number, value: string) {
    setForm((f) => ({
      ...f,
      options: f.options.map((o, idx) => (idx === i ? value : o)),
    }));
  }

  function addOption() {
    setForm((f) => ({ ...f, options: [...f.options, ""] }));
  }

  function removeOption(i: number) {
    setForm((f) => {
      if (f.options.length <= 2) return f;
      const options = f.options.filter((_, idx) => idx !== i);
      const answerIndex =
        f.answerIndex === i ? 0 : f.answerIndex > i ? f.answerIndex - 1 : f.answerIndex;
      return { ...f, options, answerIndex };
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const options = form.options.map((o) => o.trim()).filter(Boolean);
    if (!form.question.trim()) return setFormError("문제 내용을 입력하세요.");
    if (options.length < 2) return setFormError("선택지는 2개 이상이어야 합니다.");
    if (form.answerIndex >= options.length)
      return setFormError("정답으로 선택한 항목이 비어 있습니다.");

    const payload: QuestionInput = {
      materialId: form.materialId || null,
      category: effectiveCategory,
      type: form.type,
      situation: form.type === "situational" ? form.situation.trim() : undefined,
      question: form.question.trim(),
      options,
      answerIndex: form.answerIndex,
      difficulty: form.difficulty,
      points: form.points,
      explanation: form.explanation.trim(),
      reference: form.reference.trim(),
    };

    setSubmitting(true);
    setFormError(null);
    try {
      await onSave(payload, editingQuestion?.id);
      setForm(emptyForm);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="h-fit lg:sticky lg:top-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-bold text-ink">
          {editingQuestion ? "문제 수정" : "새 문제 출제"}
        </p>
        {editingQuestion && (
          <button
            type="button"
            onClick={resetForm}
            className="text-xs text-ink-muted hover:text-ink"
          >
            새로 작성
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>출처 학습자료</span>
          <select
            value={form.materialId}
            onChange={(e) => onMaterialChange(e.target.value)}
            className={inputCls}
          >
            <option value="">자료 없음 (카테고리 직접 지정)</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                [{m.category}] {m.title}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>역량 영역</span>
            <select
              value={effectiveCategory}
              onChange={(e) => set("category", e.target.value as CategoryCode)}
              disabled={!!selectedMaterial}
              className={inputCls}
            >
              {CATEGORIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>유형</span>
            <select
              value={form.type}
              onChange={(e) => set("type", e.target.value as QType)}
              className={inputCls}
            >
              <option value="multiple_choice">선택형</option>
              <option value="situational">상황형</option>
            </select>
          </label>
        </div>
        {selectedMaterial && (
          <p className="-mt-1 text-[11px] text-ink-faint">
            카테고리는 선택한 자료({selectedMaterial.category})를 따릅니다.
          </p>
        )}

        {form.type === "situational" && (
          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>상황 제시</span>
            <textarea
              value={form.situation}
              onChange={(e) => set("situation", e.target.value)}
              placeholder="예: 야간 수색정찰 중 전방 100m에서 미상 인원 3명이 접근 중입니다."
              rows={3}
              className={inputCls}
            />
          </label>
        )}

        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>문제</span>
          <textarea
            value={form.question}
            onChange={(e) => set("question", e.target.value)}
            placeholder="가장 적절한 행동은?"
            rows={2}
            className={inputCls}
          />
        </label>

        <div className="flex flex-col gap-1.5">
          <span className={labelCls}>선택지 · 정답 지정</span>
          {form.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name="answer"
                checked={form.answerIndex === i}
                onChange={() => set("answerIndex", i)}
                className="h-4 w-4 shrink-0 accent-primary-500"
                aria-label={`${i + 1}번을 정답으로`}
              />
              <input
                value={opt}
                onChange={(e) => setOption(i, e.target.value)}
                placeholder={`선택지 ${i + 1}`}
                className={inputCls}
              />
              {form.options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(i)}
                  className="shrink-0 text-ink-faint hover:text-red-400"
                  aria-label="선택지 삭제"
                >
                  <Icon name="x" size={16} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addOption}
            className="mt-1 flex items-center gap-1 text-xs font-medium text-primary-300 hover:text-primary-200"
          >
            <Icon name="plus" size={14} /> 선택지 추가
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>난이도 (1~5)</span>
            <select
              value={form.difficulty}
              onChange={(e) => set("difficulty", Number(e.target.value))}
              className={inputCls}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  Lv.{n}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>배점</span>
            <input
              type="number"
              min={1}
              value={form.points}
              onChange={(e) => set("points", Math.max(1, Number(e.target.value) || 1))}
              className={inputCls}
            />
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>해설</span>
          <textarea
            value={form.explanation}
            onChange={(e) => set("explanation", e.target.value)}
            placeholder="정답 근거를 설명합니다 (채점 후 장병에게 표시)."
            rows={2}
            className={inputCls}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>출처 (교범 인용)</span>
          <input
            value={form.reference}
            onChange={(e) => set("reference", e.target.value)}
            placeholder="예: FM 7-8, 3장 분대 공격 절차"
            className={inputCls}
          />
        </label>

        {formError && (
          <p className="rounded-lg bg-red-500/15 px-3 py-2 text-xs font-medium text-red-300">
            {formError}
          </p>
        )}

        <Button type="submit" variant="signal" className="w-full" loading={submitting}>
          <Icon name="check" size={18} />
          {editingQuestion ? "수정 저장" : "문제 출제"}
        </Button>
      </form>
    </Card>
  );
}
