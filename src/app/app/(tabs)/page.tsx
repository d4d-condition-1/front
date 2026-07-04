import Link from "next/link";

import { Badge, Button, Card, Icon, RadarChart } from "@/components/ui";
import {
  getCategory,
  getMyScores,
  gradeOf,
  overallScore,
  weakestCategory,
} from "@/features/categories";
import { toRadarData } from "@/features/report";

export default function AppHome() {
  const scores = getMyScores();
  const overall = overallScore(scores);
  const grade = gradeOf(overall);
  const weak = weakestCategory(scores);
  const weakCat = getCategory(weak.code);

  return (
    <div className="flex flex-col gap-5 px-5 pb-6 pt-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">전투 숙달 가속기</p>
          <h1 className="text-xl font-bold text-slate-900">김일병 님</h1>
        </div>
        <Badge tone="slate" className="px-3 py-1.5">
          1소대 3분대
        </Badge>
      </header>

      {/* 종합 점수 + 등급 */}
      <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 p-5 text-white shadow-sm">
        <div className="grid h-20 w-20 place-items-center rounded-2xl bg-white/15 text-4xl font-black backdrop-blur">
          {grade}
        </div>
        <div className="flex-1">
          <p className="text-xs text-primary-100">종합 숙련도</p>
          <p className="text-3xl font-black">
            {overall}
            <span className="text-base font-medium text-primary-200"> / 100</span>
          </p>
          <p className="mt-1 text-xs text-primary-100">등급 {grade}</p>
        </div>
      </div>

      {/* 레이더 차트 */}
      <Card className="flex flex-col items-center">
        <p className="mb-1 w-full text-sm font-bold text-slate-900">역량 프로필</p>
        <RadarChart data={toRadarData(scores)} size={280} />
      </Card>

      {/* 약점 집중 훈련 */}
      <Card className="flex items-center gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-red-50 text-red-500">
          <Icon name="target" size={24} />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-red-500">약점 영역</p>
          <p className="font-semibold text-slate-900">
            {weakCat.name} <span className="text-slate-400">({weak.score}점)</span>
          </p>
        </div>
      </Card>

      <Link href="/app/training">
        <Button size="lg">
          <Icon name="target" size={20} /> 약점 집중 훈련 시작
        </Button>
      </Link>

      <Link
        href="/app/diagnostic"
        className="flex items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-sm font-semibold text-primary-600 ring-1 ring-primary-100"
      >
        <Icon name="chart" size={18} /> 진단 테스트 다시 하기
      </Link>
    </div>
  );
}
