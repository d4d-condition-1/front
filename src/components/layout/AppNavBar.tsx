"use client";

import { usePathname } from "next/navigation";

import { NotificationBell } from "@/features/notifications";

/** 탭 루트별 화면 제목 (상단 바 가운데 표시) */
const TITLES: Record<string, string> = {
  "/app": "홈",
  "/app/training": "훈련 선택",
  "/app/diagnostic": "진단 테스트",
  "/app/programs": "커리큘럼",
  "/app/report": "리포트",
  "/app/profile": "프로필",
};

/** 자체 상단바(종료 버튼)를 가진 몰입형 세션 화면에서는 네비바를 숨긴다 */
const IMMERSIVE = ["/app/training/session", "/app/diagnostic"];

export function AppNavBar() {
  const pathname = usePathname();
  const title = TITLES[pathname] ?? "";

  if (IMMERSIVE.some((p) => pathname.startsWith(p))) return null;

  return (
    <div className="sticky top-0 z-60 flex items-center justify-between border-b border-line  px-2 py-2 backdrop-blur">
      <span className="text-sm font-semibold text-ink">{title}</span>

      <NotificationBell />
    </div>
  );
}
