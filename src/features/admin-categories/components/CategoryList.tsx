"use client";

import { useState } from "react";

import { Badge, Button, Card, Spinner } from "@/components/ui";
import type { AdminCategory, UpdateCategoryInput } from "../api/categoryAdminApi";
import { ColorPicker, inputCls } from "./CategoryForm";

/* ─── Single row ─── */

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
  const [form, setForm] = useState<{ name: string; description: string; color: string }>({
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

/* ─── List wrapper ─── */

interface CategoryListProps {
  categories: AdminCategory[];
  loading: boolean;
  error: string | null;
  onUpdate: (code: string, input: UpdateCategoryInput) => Promise<unknown>;
  onDelete: (code: string) => Promise<void>;
}

export function CategoryList({ categories, loading, error, onUpdate, onDelete }: CategoryListProps) {
  if (loading) {
    return (
      <div className="grid place-items-center py-20 text-primary-500">
        <Spinner size={24} />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-400">{error}</p>;
  }

  return (
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
            <CategoryRow key={cat.code} cat={cat} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </ul>
      )}
    </Card>
  );
}
