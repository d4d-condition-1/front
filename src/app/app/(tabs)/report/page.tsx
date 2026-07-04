import { Badge, Card, Icon, RadarChart } from "@/components/ui";
import { getCategory, getMyScores, gradeOf } from "@/features/categories";
import { getAnalysis, getTrainingStats, toRadarData } from "@/features/report";

export default function ReportPage() {
  const scores = getMyScores();
  const stats = getTrainingStats();
  const analysis = getAnalysis();

  const tiles = [
    { label: "정답률", value: `${stats.overallAccuracy}%`, icon: "target" as const },
    { label: "누적 풀이", value: `${stats.totalSolved}`, icon: "check" as const },
    { label: "평균 응답", value: `${stats.avgResponseSec}초`, icon: "clock" as const },
    { label: "최고 연속", value: `${stats.bestStreak}`, icon: "flame" as const },
  ];

  return (
    <div className="flex flex-col gap-4 px-5 pb-6 pt-6">
      <h1 className="text-xl font-bold text-slate-900">학습 리포트</h1>

      <Card className="flex flex-col items-center">
        <p className="mb-1 w-full text-sm font-bold text-slate-900">역량 레이더</p>
        <RadarChart data={toRadarData(scores)} size={280} />
      </Card>

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

      {/* 강점 / 약점 */}
      <Card className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <Badge tone="green">강점</Badge>
          <div>
            <p className="font-semibold text-slate-900">
              {analysis.strength.name} ({analysis.strength.score}점)
            </p>
            <p className="text-sm text-slate-500">{analysis.strength.note}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Badge tone="red">약점</Badge>
          <div>
            <p className="font-semibold text-slate-900">
              {analysis.weakness.name} ({analysis.weakness.score}점)
            </p>
            <p className="text-sm text-slate-500">{analysis.weakness.note}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl bg-indigo-50 p-3">
          <Badge tone="indigo">추천</Badge>
          <p className="text-sm font-medium text-indigo-800">{analysis.recommendation}</p>
        </div>
      </Card>

      {/* 카테고리별 상세 */}
      <Card className="p-0">
        <p className="border-b border-slate-100 px-5 py-4 text-sm font-bold text-slate-900">
          영역별 숙련도
        </p>
        <ul>
          {scores.map((s) => {
            const cat = getCategory(s.code);
            return (
              <li key={s.code} className="flex items-center gap-3 border-b border-slate-50 px-5 py-3 last:border-0">
                <span
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[11px] font-bold text-white"
                  style={{ backgroundColor: cat.color }}
                >
                  {s.code}
                </span>
                <span className="flex-1 text-sm font-medium text-slate-700">{cat.name}</span>
                <span className="text-sm font-bold text-slate-900">{s.score}</span>
                <Badge tone={s.score >= 60 ? "green" : "amber"}>{gradeOf(s.score)}</Badge>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
