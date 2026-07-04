"use client";

import { AdminHeader } from "@/components/layout";
import { Card, Icon, type IconName } from "@/components/ui";
import { useDashboard } from "../hooks/useDashboard";

const gradeColor: Record<string, string> = {
  S: "bg-primary-600",
  A: "bg-emerald-500",
  B: "bg-sky-500",
  C: "bg-amber-500",
  D: "bg-red-500",
};

/** 관리자 대시보드 화면 (데이터는 useDashboard 훅이 담당). */
export function DashboardView() {
  const { data, loading, error } = useDashboard();

  if (loading) return <AdminStatus message="현황을 불러오는 중..." />;
  if (error || !data) {
    return (
      <AdminStatus
        message={error?.message ?? "현황을 불러오지 못했습니다."}
        isError
      />
    );
  }

  const maxCount = Math.max(1, ...data.gradeDist.map((g) => g.count));

  const stats: { label: string; value: string; icon: IconName; tone: string }[] = [
    { label: "전체 장병", value: `${data.totalTrainees}명`, icon: "users", tone: "bg-primary-50 text-primary-600" },
    { label: "평균 숙련도", value: `${data.avgProficiency}점`, icon: "target", tone: "bg-emerald-50 text-emerald-600" },
    { label: "오늘 훈련", value: `${data.trainedToday}명`, icon: "flame", tone: "bg-amber-50 text-amber-600" },
    { label: "AI 요청(누적)", value: data.aiRequests.toLocaleString(), icon: "cpu", tone: "bg-slate-200/70 text-slate-700" },
  ];

  return (
    <>
      <AdminHeader title="부대 현황" description="전투 숙달 현황 한눈에 보기" />

      <div className="flex flex-col gap-6 p-6 md:p-8">
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

        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          {/* 등급 분포 */}
          <Card>
            <p className="mb-4 font-bold text-slate-900">등급 분포</p>
            <div className="flex flex-col gap-3">
              {data.gradeDist.map((g) => (
                <div key={g.grade} className="flex items-center gap-3">
                  <span className="w-4 text-sm font-bold text-slate-500">{g.grade}</span>
                  <div className="h-6 flex-1 overflow-hidden rounded-lg bg-slate-100">
                    <div
                      className={`h-full rounded-lg ${gradeColor[g.grade]}`}
                      style={{ width: `${(g.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm font-semibold text-slate-700">{g.count}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* 최근 활동 */}
          <Card className="p-0">
            <p className="border-b border-slate-100 px-6 py-4 font-bold text-slate-900">최근 활동</p>
            {data.recentActivity.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-slate-400">
                아직 활동 기록이 없습니다.
              </p>
            ) : (
              <ul>
                {data.recentActivity.map((a, i) => (
                  <li key={i} className="flex items-center gap-3 border-b border-slate-50 px-6 py-3.5 last:border-0">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
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
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

/** 로딩/에러 공통 표시 */
export function AdminStatus({
  message,
  isError = false,
}: {
  message: string;
  isError?: boolean;
}) {
  return (
    <div className="grid min-h-[50vh] place-items-center p-6">
      <p className={`text-sm ${isError ? "text-red-500" : "text-slate-400"}`}>
        {message}
      </p>
    </div>
  );
}
