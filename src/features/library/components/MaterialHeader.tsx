"use client";

import Link from "next/link";

import { Badge, Icon } from "@/components/ui";
import { getCategory } from "@/features/categories";
import type { MaterialDetail } from "../api/libraryApi";

interface Props {
  material: MaterialDetail;
  questionCount: number;
}

export function MaterialHeader({ material, questionCount }: Props) {
  const cat = getCategory(material.category);

  return (
    <div className="flex items-center gap-3">
      <Link href="/admin/materials" className="text-ink-faint hover:text-ink">
        <Icon name="chevronLeft" size={22} />
      </Link>
      <div
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[11px] font-bold text-white"
        style={{ backgroundColor: cat.color }}
      >
        {material.category}
      </div>
      <div className="min-w-0">
        <h1 className="truncate text-lg font-bold text-ink">{material.title}</h1>
        <p className="text-xs text-ink-faint">
          {cat.name} · {material.pages}페이지 · {questionCount}개 문제
        </p>
      </div>
      <Badge tone={material.isActive ? "green" : "slate"} className="ml-auto">
        {material.isActive ? "활성" : "비활성"}
      </Badge>
    </div>
  );
}
