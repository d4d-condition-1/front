import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/** 카드 컨테이너 — 다크 전술 표면 + 각진 모서리 + 헤어라인 보더. */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-surface p-5 ring-1 ring-line",
        className,
      )}
      {...props}
    />
  );
}
