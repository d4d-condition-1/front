"use client";

import { useState } from "react";

import { getMaterials, MaterialCard, type Category } from "@/features/materials";
import { cn } from "@/lib/utils";

type Filter = "전체" | Category;
const FILTERS: Filter[] = ["전체", "LC", "RC"];

export default function LearnPage() {
  const [filter, setFilter] = useState<Filter>("전체");
  const materials = getMaterials();
  const list =
    filter === "전체" ? materials : materials.filter((m) => m.category === filter);

  return (
    <div className="flex flex-col gap-4 px-5 pb-6 pt-6">
      <h1 className="text-xl font-bold text-slate-900">학습자료</h1>

      {/* 카테고리 필터 */}
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
              filter === f
                ? "bg-indigo-600 text-white"
                : "bg-white text-slate-500 ring-1 ring-slate-200",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {list.map((m) => (
          <MaterialCard key={m.id} material={m} />
        ))}
      </div>
    </div>
  );
}
