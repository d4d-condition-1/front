import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type Tone = "primary" | "green" | "amber" | "slate" | "red" | "signal";

/** 다크 전술 칩 — 반투명 틴트 + 밝은 텍스트. */
const tones: Record<Tone, string> = {
  primary: "bg-primary-500/15 text-primary-300",
  green: "bg-emerald-500/15 text-emerald-300",
  amber: "bg-amber-500/15 text-amber-300",
  signal: "bg-signal-300/15 text-signal-300",
  slate: "bg-surface-2 text-ink-muted",
  red: "bg-red-500/15 text-red-300",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

/** 상태/카테고리 표시용 작은 라벨. */
export function Badge({ tone = "slate", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
