import { Card } from "@/components/ui";

interface ScoreTrendProps {
  history: { label: string; score: number }[];
}

/** 점수 추이 막대 차트 (의존성 없이 div 로 구현). */
export function ScoreTrend({ history }: ScoreTrendProps) {
  const max = Math.max(...history.map((h) => h.score));
  const min = Math.min(...history.map((h) => h.score));
  const range = Math.max(1, max - min);

  return (
    <Card>
      <p className="mb-4 text-sm font-bold text-slate-900">점수 추이</p>
      <div className="flex h-36 items-end justify-between gap-2">
        {history.map((h) => {
          const heightPct = 30 + ((h.score - min) / range) * 70;
          return (
            <div key={h.label} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="text-[10px] font-semibold text-slate-500">{h.score}</span>
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-indigo-500 to-indigo-400"
                style={{ height: `${heightPct}%` }}
              />
              <span className="text-[10px] text-slate-400">{h.label}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
