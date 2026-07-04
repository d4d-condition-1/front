"use client";

import { type FormEvent, useState } from "react";

import { Badge, Button, Card, Icon } from "@/components/ui";
import { AdminStatus } from "@/features/admin-dashboard";
import { CATEGORIES, getCategory, type CategoryCode } from "@/features/categories";
import { useLibrary } from "../hooks/useLibrary";

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15";

/** 학습 자료 관리 (등록 · 목록 · 활성 토글 · 삭제). */
export function LibraryManager() {
  const { items, loading, error, create, toggle, remove } = useLibrary();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<CategoryCode>("TAC");
  const [pages, setPages] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setFormError(null);
    try {
      await create({
        title: title.trim(),
        category,
        pages: Math.max(0, Number(pages) || 0),
      });
      setTitle("");
      setPages("");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <AdminStatus message="자료 목록을 불러오는 중..." />;
  if (error) return <AdminStatus message={error.message} isError />;

  const totalPages = items.reduce((s, i) => s + i.pages, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* 자료 목록 */}
      <div className="flex flex-col gap-4">
        <p className="text-sm text-slate-400">
          총 {items.length}개 자료 · {totalPages}페이지
        </p>

        <div className="flex flex-col gap-3">
          {items.length === 0 && (
            <Card className="py-10 text-center text-sm text-slate-400">
              등록된 자료가 없습니다. 우측 폼에서 등록하세요.
            </Card>
          )}
          {items.map((it) => {
            const cat = getCategory(it.category);
            return (
              <Card key={it.id} className="flex items-center gap-4">
                <div
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-[11px] font-bold text-white"
                  style={{ backgroundColor: cat.color }}
                >
                  {it.category}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-slate-800">{it.title}</p>
                    <Badge tone={it.isActive ? "green" : "slate"}>
                      {it.isActive ? "활성" : "비활성"}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {cat.name} · {it.pages}페이지 · {it.uploadedAt}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => toggle(it)}>
                  {it.isActive ? "비활성" : "활성"}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  
                  onClick={() => {
                    if (confirm(`'${it.title}' 자료를 삭제할까요?`)) remove(it.id);
                  }}
                >
                  삭제
                </Button>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 신규 등록 폼 */}
      <Card className="h-fit">
        <p className="mb-4 font-bold text-slate-900">자료 등록</p>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-500">제목</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: FM 7-8 보병소대 전술"
              className={inputCls}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-500">카테고리</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryCode)}
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
            <span className="text-xs font-medium text-slate-500">페이지 수</span>
            <input
              value={pages}
              onChange={(e) => setPages(e.target.value)}
              placeholder="예: 32"
              type="number"
              min={0}
              className={inputCls}
            />
          </label>

          {formError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
              {formError}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            <Icon name="plus" size={18} />
            {submitting ? "등록 중..." : "자료 등록"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
