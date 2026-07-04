import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type Tone = "indigo" | "green" | "amber" | "slate" | "red";

const tones: Record<Tone, string> = {
  indigo: "bg-indigo-50 text-indigo-700",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  slate: "bg-slate-100 text-slate-600",
  red: "bg-red-50 text-red-600",
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
