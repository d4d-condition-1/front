import { AdminHeader } from "@/components/layout";
import { Card, Icon, type IconName } from "@/components/ui";
import { getDashboard } from "@/features/admin-dashboard";

export default function AdminDashboard() {
  const data = getDashboard();

  const stats: { label: string; value: string; icon: IconName; tone: string }[] = [
    { label: "전체 사용자", value: data.totalUsers.toLocaleString(), icon: "users", tone: "bg-indigo-50 text-indigo-600" },
    { label: "오늘 활성", value: data.activeToday.toLocaleString(), icon: "flame", tone: "bg-amber-50 text-amber-600" },
    { label: "오늘 푼 문제", value: data.solvedToday.toLocaleString(), icon: "check", tone: "bg-emerald-50 text-emerald-600" },
    { label: "AI 요청(누적)", value: data.aiRequests.toLocaleString(), icon: "cpu", tone: "bg-violet-50 text-violet-600" },
  ];

  return (
    <>
      <AdminHeader title="대시보드" description="서비스 현황 한눈에 보기" />

      <div className="flex flex-col gap-6 p-6 md:p-8">
        {/* 지표 카드 */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label} className="flex items-center gap-4">
              <span className={`grid h-12 w-12 place-items-center rounded-xl ${s.tone}`}>
                <Icon name={s.icon} size={24} />
              </span>
              <div>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-sm text-slate-400">{s.label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* 최근 활동 */}
        <Card className="p-0">
          <p className="border-b border-slate-100 px-6 py-4 font-bold text-slate-900">
            최근 활동
          </p>
          <ul>
            {data.recentActivity.map((a, i) => (
              <li
                key={i}
                className="flex items-center gap-3 border-b border-slate-50 px-6 py-4 last:border-0"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                  {a.user.slice(0, 1)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800">{a.user}</p>
                  <p className="truncate text-sm text-slate-500">{a.action}</p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">{a.time}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
