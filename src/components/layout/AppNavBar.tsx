"use client";

import { usePathname, useRouter } from "next/navigation";

import { Icon } from "@/components/ui";
import { NotificationBell } from "@/features/notifications";

/** 탭 루트별 화면 제목 (상단 바 가운데 표시) */
const TITLES: Record<string, string> = {
  "/app": "홈",
  "/app/training": "적응형 훈련",
  "/app/diagnostic": "진단 테스트",
  "/app/fitness": "특급전사",
  "/app/programs": "커리큘럼",
  "/app/report": "리포트",
  "/app/profile": "프로필",
};

/**
 * 앱 상단 내비게이션 바 — 진짜 앱처럼 뒤로/앞으로 이동.
 * 브라우저 history 를 그대로 사용하므로 실제 방문 순서대로 동작한다.
 */
/** 자체 상단바(종료 버튼)를 가진 몰입형 세션 화면에서는 네비바를 숨긴다 */
const IMMERSIVE = ["/app/training", "/app/diagnostic"];

export function AppNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const title = TITLES[pathname] ?? "";

  if (IMMERSIVE.some((p) => pathname.startsWith(p))) return null;

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-100 bg-white/90 px-2 py-2 backdrop-blur">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로 가기"
          className="grid h-9 w-9 place-items-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 active:scale-95"
        >
          <Icon name="chevronLeft" size={22} />
        </button>
        <button
          type="button"
          onClick={() => router.forward()}
          aria-label="앞으로 가기"
          className="grid h-9 w-9 place-items-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 active:scale-95"
        >
          <Icon name="chevronRight" size={22} />
        </button>
      </div>

      <span className="text-sm font-semibold text-slate-700">{title}</span>

      <NotificationBell />
    </div>
  );
}
