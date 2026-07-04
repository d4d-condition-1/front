import Link from "next/link";

import { Badge, Card, Icon, ProgressRing } from "@/components/ui";
import { getMaterials, MaterialCard } from "@/features/materials";
import { getStats } from "@/features/report";

export default function AppHome() {
  const stats = getStats();
  const materials = getMaterials();
  const continueMaterial = materials.find((m) => m.progress > 0 && m.progress < 100);
  const recommended = materials.filter((m) => m.tag).slice(0, 3);

  return (
    <div className="flex flex-col gap-5 px-5 pb-6 pt-6">
      {/* 인사 + 연속 학습 */}
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">안녕하세요 👋</p>
          <h1 className="text-xl font-bold text-slate-900">학습자님</h1>
        </div>
        <Badge tone="amber" className="gap-1 px-3 py-1.5">
          <Icon name="flame" size={16} /> {stats.streak}일 연속
        </Badge>
      </header>

      {/* 예상 점수 카드 */}
      <div className="flex items-center gap-5 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 p-5 text-white shadow-sm">
        <ProgressRing
          value={Math.round((stats.predictedScore / 990) * 100)}
          size={104}
          stroke={10}
        />
        <div className="flex-1">
          <p className="text-xs text-indigo-100">예상 점수</p>
          <p className="text-3xl font-black">
            {stats.predictedScore}
            <span className="text-base font-medium text-indigo-200"> / 990</span>
          </p>
          <div className="mt-2 flex gap-4 text-xs text-indigo-100">
            <span>LC {stats.lcScore}</span>
            <span>RC {stats.rcScore}</span>
          </div>
        </div>
      </div>

      {/* 이어서 학습 */}
      {continueMaterial && (
        <Link href={`/app/solve/${continueMaterial.id}`}>
          <Card className="flex items-center gap-4 transition-shadow hover:shadow-md">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white">
              <Icon name="play" size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-indigo-600">이어서 학습하기</p>
              <p className="truncate font-semibold text-slate-900">
                {continueMaterial.title}
              </p>
            </div>
            <span className="text-sm font-bold text-slate-400">
              {continueMaterial.progress}%
            </span>
          </Card>
        </Link>
      )}

      {/* 추천 학습 */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-900">추천 학습</h2>
          <Link href="/app/learn" className="text-xs font-medium text-indigo-600">
            전체 보기
          </Link>
        </div>
        {recommended.map((m) => (
          <MaterialCard key={m.id} material={m} />
        ))}
      </section>
    </div>
  );
}
