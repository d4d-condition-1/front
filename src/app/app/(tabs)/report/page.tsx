import { Card, Icon } from "@/components/ui";
import { getStats, PartAccuracyList, ScoreTrend } from "@/features/report";

export default function ReportPage() {
  const stats = getStats();

  const tiles = [
    { label: "정답률", value: `${stats.accuracy}%`, icon: "target" as const },
    { label: "연속 학습", value: `${stats.streak}일`, icon: "flame" as const },
    { label: "주간 학습", value: `${stats.weeklyMinutes}분`, icon: "clock" as const },
    { label: "누적 풀이", value: `${stats.solvedTotal}`, icon: "check" as const },
  ];

  return (
    <div className="flex flex-col gap-4 px-5 pb-6 pt-6">
      <h1 className="text-xl font-bold text-slate-900">내 리포트</h1>

      {/* 요약 타일 */}
      <div className="grid grid-cols-2 gap-3">
        {tiles.map((t) => (
          <Card key={t.label} className="flex items-center gap-3 p-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <Icon name={t.icon} size={20} />
            </span>
            <div>
              <p className="text-lg font-bold text-slate-900">{t.value}</p>
              <p className="text-xs text-slate-400">{t.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <ScoreTrend history={stats.history} />
      <PartAccuracyList items={stats.byPart} />
    </div>
  );
}
