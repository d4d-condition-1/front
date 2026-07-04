"use client";

import { useState } from "react";

import { AdminHeader } from "@/components/layout";
import { Badge, Button, Card, Icon, Spinner } from "@/components/ui";
import { useAdminCategories } from "../hooks/useAdminCategories";
import type { AdminCategory, CreateCategoryInput, UpdateCategoryInput } from "../api/categoryAdminApi";

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

function CategoryRow({
  cat,
  onUpdate,
  onDelete,
}: {
  cat: AdminCategory;
  onUpdate: (code: string, input: UpdateCategoryInput) => Promise<unknown>;
  onDelete: (code: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Omit<FormState, "code">>({
    name: cat.name,
    description: cat.description,
    color: cat.color,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSave() {
    if (!form.name.trim()) return setError("이름을 입력하세요.");
    setSaving(true);
    setError(null);
    try {
      await onUpdate(cat.code, {
        name: form.name.trim(),
        description: form.description.trim(),
        color: form.color,
      });
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  }

  async function onDel() {
    if (!confirm(`"${cat.name}" 카테고리를 삭제할까요?`)) return;
    setDeleting(true);
    try {
      await onDelete(cat.code);
    } catch (e) {
      setError(e instanceof Error ? e.message : "삭제 실패");
      setDeleting(false);
    }
  }

  return (
    <li className="flex flex-col gap-2 border-b border-line/60 px-5 py-4 last:border-0">
      {!editing ? (
        <div className="flex items-center gap-4">
          <div
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xs font-bold text-white"
            style={{ backgroundColor: cat.color }}
          >
            {cat.code}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-ink">{cat.name}</p>
            <p className="truncate text-xs text-ink-faint">{cat.description || "설명 없음"}</p>
          </div>
          <Badge tone="slate">{cat.questionCount}문제</Badge>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              수정
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={deleting}
              disabled={cat.questionCount > 0}
              onClick={onDel}
              title={cat.questionCount > 0 ? "문제를 먼저 삭제하세요" : "삭제"}
            >
              삭제
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-2xl bg-surface-2 p-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-ink-muted">이름 *</span>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className={inputCls}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-ink-muted">코드</span>
              <input value={cat.code} disabled className={`${inputCls} opacity-50`} />
            </label>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-ink-muted">설명</span>
            <input
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="한 줄 설명"
              className={inputCls}
            />
          </label>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-ink-muted">색상</span>
            <ColorPicker value={form.color} onChange={(c) => setForm((p) => ({ ...p, color: c }))} />
          </div>
          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>
          )}
          <div className="flex gap-2">
            <Button size="sm" loading={saving} onClick={onSave}>저장</Button>
            <Button variant="secondary" size="sm" onClick={() => { setEditing(false); setError(null); }}>
              취소
            </Button>
          </div>
        </div>
      )}
      {error && !editing && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </li>
  );
}

export function CategoriesManager() {
  const { categories, loading, error, create, update, remove } = useAdminCategories();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function onSubmit() {
    setFormError(null);
    if (!form.code.trim()) return setFormError("코드를 입력하세요.");
    if (!form.name.trim()) return setFormError("이름을 입력하세요.");
    setSubmitting(true);
    try {
      await create({
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        description: form.description.trim(),
        color: form.color,
      } as CreateCategoryInput);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "생성 실패");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <AdminHeader
        title="카테고리 관리"
        description="훈련 영역(카테고리)을 추가·수정·삭제합니다. 카테고리는 문제·자료·점수와 연결됩니다."
      />

      {/* 새 카테고리 폼 */}
      {showForm ? (
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
            <Button variant="secondary" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setFormError(null); }}>
              취소
            </Button>
          </div>
        </Card>
      ) : (
        <Button className="self-start" onClick={() => setShowForm(true)}>
          <Icon name="plus" size={16} /> 새 카테고리
        </Button>
      )}

      {/* 목록 */}
      {loading ? (
        <div className="grid place-items-center py-20 text-primary-500">
          <Spinner size={24} />
        </div>
      ) : error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : (
        <Card className="p-0">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <p className="text-sm font-bold text-ink">카테고리 목록</p>
            <Badge tone="slate">{categories.length}개</Badge>
          </div>
          {categories.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-ink-faint">
              카테고리가 없습니다. 새 카테고리를 추가하세요.
            </p>
          ) : (
            <ul>
              {categories.map((cat) => (
                <CategoryRow key={cat.code} cat={cat} onUpdate={update} onDelete={remove} />
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}
