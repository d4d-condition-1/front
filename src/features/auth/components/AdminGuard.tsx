"use client";

import { type ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useUser } from "../hooks/useUser";

/**
 * 관리자 전용 화면 가드.
 * 미로그인 또는 일반 사용자는 랜딩(로그인)으로 돌려보낸다.
 * (서버 API 도 requireAdmin 으로 이중 차단되어 있어 화면 우회로는 데이터에 접근할 수 없다)
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user?.role !== "admin") router.replace("/");
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="grid min-h-screen flex-1 place-items-center text-sm text-ink-faint">
        권한 확인 중...
      </div>
    );
  }
  if (user?.role !== "admin") return null;

  return <>{children}</>;
}
