import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0~100
  className?: string;
  barClassName?: string;
}

/** 가로 진행바. */
export function ProgressBar({ value, className, barClassName }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-slate-100", className)}>
      <div
        className={cn("h-full rounded-full bg-indigo-600 transition-all", barClassName)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
