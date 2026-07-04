"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { SessionRunner } from "@/features/training";
import type { TrainingMode } from "@/features/training";
import type { CategoryCode } from "@/features/categories";
import { Spinner } from "@/components/ui";

function TrainingSession() {
  const params = useSearchParams();
  const mode = (params.get("mode") ?? "adaptive") as TrainingMode;
  const category = (params.get("category") ?? undefined) as CategoryCode | undefined;
  const catName = params.get("name");
  const title = catName ? `${catName} 집중 훈련` : "적응형 훈련";

  return (
    <SessionRunner
      title={title}
      mode={mode}
      category={category}
      exitHref="/app/training"
      ctaHref="/app/report"
      ctaLabel="리포트 보기"
    />
  );
}

export default function TrainingSessionPage() {
  return (
    <Suspense fallback={<div className="grid min-h-dvh place-items-center text-primary-600"><Spinner size={28} /></div>}>
      <TrainingSession />
    </Suspense>
  );
}
