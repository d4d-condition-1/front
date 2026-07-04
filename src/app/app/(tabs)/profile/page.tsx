import Link from "next/link";

import { Badge, Card, Icon, type IconName } from "@/components/ui";
import { getStats } from "@/features/report";

const menu: { label: string; icon: IconName }[] = [
  { label: "학습 목표 설정", icon: "target" },
  { label: "알림 설정", icon: "clock" },
  { label: "학습 기록", icon: "chart" },
  { label: "설정", icon: "settings" },
];

export default function ProfilePage() {
  const stats = getStats();

  return (
    <div className="flex flex-col gap-4 px-5 pb-6 pt-6">
      <h1 className="text-xl font-bold text-slate-900">프로필</h1>

      {/* 프로필 카드 */}
      <Card className="flex items-center gap-4">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700">
          학
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-bold text-slate-900">학습자님</p>
            <Badge tone="indigo">프리미엄</Badge>
          </div>
          <p className="text-xs text-slate-400">목표 850점 · 예상 {stats.predictedScore}점</p>
        </div>
      </Card>

      {/* 메뉴 */}
      <Card className="divide-y divide-slate-50 p-0">
        {menu.map((m) => (
          <button
            key={m.label}
            className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm hover:bg-slate-50"
          >
            <span className="text-slate-400">
              <Icon name={m.icon} size={20} />
            </span>
            <span className="flex-1 font-medium text-slate-700">{m.label}</span>
            <Icon name="chevronRight" size={18} className="text-slate-300" />
          </button>
        ))}
      </Card>

      <Link
        href="/"
        className="flex items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-sm font-semibold text-slate-400 ring-1 ring-slate-200"
      >
        <Icon name="logout" size={18} /> 로그아웃
      </Link>
    </div>
  );
}
