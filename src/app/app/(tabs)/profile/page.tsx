"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Badge, Card, Icon, Spinner, type IconName } from "@/components/ui";
import { gradeOf, overallScore, useMyScores } from "@/features/categories";
import { logout, useUser } from "@/features/auth";
import { closeRealtime } from "@/features/notifications";

const menu: { label: string; icon: IconName; href: string }[] = [
  { label: "진단 테스트 다시 하기", icon: "chart", href: "/app/diagnostic" },
  { label: "특급전사 체력 기록", icon: "dumbbell", href: "/app/fitness" },
  { label: "부대 커리큘럼", icon: "list", href: "/app/programs" },
  { label: "학습 리포트", icon: "clock", href: "/app/report" },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const { scores, loading: scoresLoading } = useMyScores();
  const overall = overallScore(scores);
  const unitLabel = user?.unitName ?? user?.unit ?? "";

  async function onLogout() {
    closeRealtime();
    await logout();
    router.replace("/");
  }

  return (
    <div className="flex flex-col gap-4 px-5 pb-6 pt-6">
      <h1 className="text-xl font-bold text-ink">프로필</h1>

      <Card className="flex items-center gap-4">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-primary-100 text-lg font-bold text-primary-700">
          {user ? user.name.slice(0, 1) : "?"}
        </span>
        <div className="flex-1">
          {userLoading ? (
            <Spinner size={18} className="text-primary-500" />
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold text-ink">{user?.name ?? "-"}</p>
                {user?.rank && <Badge tone="slate">{user.rank}</Badge>}
                {!scoresLoading && <Badge tone="primary">등급 {gradeOf(overall)}</Badge>}
              </div>
              <p className="text-xs text-ink-faint">
                {[unitLabel, `종합 ${overall}점`].filter(Boolean).join(" · ")}
                {user?.loginId ? ` · @${user.loginId}` : ""}
              </p>
            </>
          )}
        </div>
      </Card>

      <Card className="divide-y divide-line p-0">
        {menu.map((m) => (
          <Link
            key={m.label}
            href={m.href}
            className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm hover:bg-surface-2"
          >
            <span className="text-ink-faint">
              <Icon name={m.icon} size={20} />
            </span>
            <span className="flex-1 font-medium text-ink">{m.label}</span>
            <Icon name="chevronRight" size={18} className="text-ink-faint" />
          </Link>
        ))}
      </Card>

      <button
        onClick={onLogout}
        className="flex items-center justify-center gap-2 rounded-2xl bg-surface py-3.5 text-sm font-semibold text-ink-faint ring-1 ring-line hover:text-ink"
      >
        <Icon name="logout" size={18} /> 로그아웃
      </button>
    </div>
  );
}
