import { Card, ProgressBar } from "@/components/ui";
import type { PartAccuracy } from "../api/reportApi";

/** 파트별 정답률 리스트. */
export function PartAccuracyList({ items }: { items: PartAccuracy[] }) {
  return (
    <Card>
      <p className="mb-4 text-sm font-bold text-slate-900">파트별 정답률</p>
      <ul className="flex flex-col gap-3">
        {items.map((it) => (
          <li key={it.part} className="flex items-center gap-3">
            <span className="w-14 shrink-0 text-xs font-medium text-slate-500">
              {it.part}
            </span>
            <ProgressBar
              value={it.accuracy}
              className="flex-1"
              barClassName={it.accuracy < 65 ? "bg-amber-400" : "bg-indigo-600"}
            />
            <span className="w-9 shrink-0 text-right text-xs font-semibold text-slate-700">
              {it.accuracy}%
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
