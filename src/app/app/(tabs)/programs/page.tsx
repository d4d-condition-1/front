"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { FitnessView } from "@/features/fitness";
import { ProgramsView } from "@/features/programs";

type Segment = "curriculum" | "fitness";

export default function CurriculumPage() {
  const [segment, setSegment] = useState<Segment>("curriculum");

  return (
    <div className="flex flex-col">
      <header className="px-5 pt-6">
        <p className="text-sm text-ink-faint">일과 관리</p>
        <h1 className="text-xl font-bold text-ink">커리큘럼</h1>
      </header>

      {/* 세그먼트 컨트롤 */}
      <div className="mx-5 mt-4 grid grid-cols-2 gap-1 rounded-2xl bg-surface-2 p-1">
        {(
          [
            { key: "curriculum", label: "부대 커리큘럼" },
            { key: "fitness", label: "특급전사" },
          ] as { key: Segment; label: string }[]
        ).map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setSegment(key)}
            className={cn(
              "rounded-xl py-2.5 text-sm font-semibold transition-colors",
              segment === key
                ? "bg-surface text-ink ring-1 ring-line"
                : "text-ink-muted hover:text-ink",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {segment === "curriculum" ? <ProgramsView /> : <FitnessView />}
    </div>
  );
}
