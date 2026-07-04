"use client";

import Link from "next/link";

import { Badge, Button, Card, Icon, RadarChart, Spinner } from "@/components/ui";
import { getCategory, gradeOf } from "@/features/categories";
import { toRadarData, useReport } from "@/features/report";

export default function ReportPage() {
  const { data, loading, error } = useReport();

  if (loading) {
    return (
      <div className="grid flex-1 place-items-center py-24 text-primary-600">
        <Spinner size={28} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="grid flex-1 place-items-center px-8 py-24 text-center text-sm text-ink-muted">
        {error ?? "리포트를 불러올 수 없습니다."}
      </div>
    );
  }

  const { stats, analysis, scores } = data;
  const hasHistory = stats.totalSolved > 0;

  const tiles = [
    { label: "정답률", value: `${stats.overallAccuracy}%`, icon: "target" as const },
    { label: "누적 풀이", value: `${stats.totalSolved}`, icon: "check" as const },
    { label: "평균 응답", value: `${stats.avgResponseSec}초`, icon: "clock" as const },
    { label: "최고 연속", value: `${stats.bestStreak}`, icon: "flame" as const },
  ];

  return (
    <div className="flex flex-col gap-4 px-5 pb-6 pt-6">
      <h1 className="text-xl font-bold text-ink">학습 리포트</h1>

      <Card className="flex flex-col items-center">
        <p className="mb-1 w-full text-sm font-bold text-ink">역량 레이더</p>
        <RadarChart data={toRadarData(scores)} size={280} />
      </Card>

      {/* 요약 타일 */}
      <div className="grid grid-cols-2 gap-3">
        {tiles.map((t) => (
          <Card key={t.label} className="flex items-center gap-3 p-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-primary-600">
              <Icon name={t.icon} size={20} />
            </span>
            <div>
              <p className="text-lg font-bold text-ink">{t.value}</p>
              <p className="text-xs text-ink-faint">{t.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* 강점 / 약점 (풀이 이력이 있을 때만) */}
      {analysis ? (
        <Card className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <Badge tone="green">강점</Badge>
            <div>
              <p className="font-semibold text-ink">
                {analysis.strength.name} ({analysis.strength.score}점)
              </p>
              <p className="text-sm text-ink-muted">{analysis.strength.note}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Badge tone="red">약점</Badge>
            <div>
              <p className="font-semibold text-ink">
                {analysis.weakness.name} ({analysis.weakness.score}점)
              </p>
              <p className="text-sm text-ink-muted">{analysis.weakness.note}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl bg-primary-50 p-3">
            <Badge tone="primary">추천</Badge>
            <p className="text-sm font-medium text-primary-800">{analysis.recommendation}</p>
          </div>
        </Card>
      ) : (
        <Card className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-surface-2 text-ink-faint">
            <Icon name="chart" size={24} />
          </div>
          <p className="text-sm text-ink-muted">
            아직 풀이 이력이 없습니다.
            <br />
            진단 테스트를 먼저 완료하면 강점·약점 분석이 표시됩니다.
          </p>
          <Link href="/app/diagnostic">
            <Button variant="secondary" size="sm">
              진단 테스트 시작
            </Button>
          </Link>
        </Card>
      )}

      {/* 카테고리별 상세 */}
      <Card className="p-0">
        <p className="border-b border-line px-5 py-4 text-sm font-bold text-ink">
          영역별 숙련도
        </p>
        <ul>
          {scores.map((s) => {
            const cat = getCategory(s.code);
            return (
              <li key={s.code} className="flex items-center gap-3 border-b border-line px-5 py-3 last:border-0">
                <span
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[11px] font-bold text-white"
                  style={{ backgroundColor: cat.color }}
                >
                  {s.code}
                </span>
                <span className="flex-1 text-sm font-medium text-ink">{cat.name}</span>
                <span className="text-sm font-bold text-ink">{s.score}</span>
                <Badge tone={s.score >= 60 ? "green" : hasHistory ? "amber" : "slate"}>
                  {gradeOf(s.score)}
                </Badge>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
