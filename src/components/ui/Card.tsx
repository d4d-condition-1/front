import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/** 카드 컨테이너 — 흰 배경 + 둥근 모서리 + 부드러운 그림자. */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100",
        className,
      )}
      {...props}
    />
  );
}
