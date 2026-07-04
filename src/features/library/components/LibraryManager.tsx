"use client";

import { useState } from "react";

import { Badge, Button, Card, Icon } from "@/components/ui";
import { CATEGORIES, getCategory } from "@/features/categories";
import { getLibrary, type LibraryItem } from "../api/libraryApi";

/** 학습 자료 관리 (업로드 mock · 목록 · 활성 토글). */
export function LibraryManager() {
  const [items, setItems] = useState<LibraryItem[]>(getLibrary);

  function toggle(id: string) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, isActive: !it.isActive } : it)),
    );
  }

  function mockUpload() {
    const cat = CATEGORIES[Math.floor(items.length % CATEGORIES.length)];
    setItems((prev) => [
      {
        id: `l${prev.length + 1}${cat.code}`,
        title: `신규 교범 (${cat.name})`,
        category: cat.code,
        pages: 10 + prev.length,
        isActive: true,
        uploadedAt: "2026-07-04",
      },
      ...prev,
    ]);
  }

  const totalPages = items.reduce((s, i) => s + i.pages, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          총 {items.length}개 자료 · {totalPages}페이지
        </p>
        <Button size="sm" onClick={mockUpload}>
          <Icon name="plus" size={18} /> 자료 업로드
        </Button>
      </div>

      <div className="flex flex-col gap-3">
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
              <Button variant="ghost" size="sm" onClick={() => toggle(it.id)}>
                {it.isActive ? "비활성" : "활성"}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
