"use client";

import { useState } from "react";

import { Button, Card } from "@/components/ui";
import type { CreateCategoryInput } from "../api/categoryAdminApi";

const inputCls =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 text-ink";

const PRESET_COLORS = [
  "#4f46e5", "#e11d48", "#0891b2", "#7c3aed",
  "#059669", "#d97706", "#475569", "#dc2626",
  "#16a34a", "#2563eb", "#9333ea", "#0d9488",
];

interface FormState {
  code: string;
  name: string;
  description: string;
  color: string;
}

const EMPTY_FORM: FormState = { code: "", name: "", description: "", color: "#4f46e5" };

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {PRESET_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className="h-7 w-7 rounded-lg ring-offset-2 transition-all"
          style={{
            backgroundColor: c,
            outline: value === c ? `2px solid ${c}` : "none",
            outlineOffset: "2px",
          }}
          aria-label={c}
        />
      ))}
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-7 cursor-pointer rounded-lg border-0 bg-transparent p-0"
        title="직접 선택"
      />
    </div>
  );
}

export { ColorPicker, inputCls, PRESET_COLORS };

interface CategoryFormProps {
  onCreate: (input: CreateCategoryInput) => Promise<unknown>;
  onCancel: () => void;
}

export function CategoryForm({ onCreate, onCancel }: CategoryFormProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function onSubmit() {
    setFormError(null);
    if (!form.code.trim()) return setFormError("코드를 입력하세요.");
    if (!form.name.trim()) return setFormError("이름을 입력하세요.");
    setSubmitting(true);
    try {
      await onCreate({
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        description: form.description.trim(),
        color: form.color,
      });
      setForm(EMPTY_FORM);
      onCancel();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "생성 실패");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="flex flex-col gap-4">
      <p className="font-bold text-ink">새 카테고리</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-ink-muted">코드 * (영문 2~8자)</span>
          <input
            value={form.code}
            onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
            placeholder="예: NBC"
            maxLength={8}
            className={inputCls}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-ink-muted">이름 *</span>
          <input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="예: 화생방"
            className={inputCls}
          />
        </label>
        <label className="flex flex-col gap-1.5 sm:col-span-1 col-span-2">
          <span className="text-xs font-medium text-ink-muted">설명</span>
          <input
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="한 줄 설명"
            className={inputCls}
          />
        </label>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-ink-muted">색상</span>
        <ColorPicker value={form.color} onChange={(c) => setForm((p) => ({ ...p, color: c }))} />
      </div>
      {formError && (
        <p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{formError}</p>
      )}
      <div className="flex gap-2">
        <Button loading={submitting} onClick={onSubmit}>카테고리 추가</Button>
        <Button variant="secondary" onClick={onCancel}>
          취소
        </Button>
      </div>
    </Card>
  );
}
