"use client";

import { type ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useUser } from "../hooks/useUser";

/**
 * 로그인 사용자 전용 화면 가드 (훈련 앱 /app 하위).
 * 미로그인은 랜딩(로그인)으로 돌려보낸다.
 * (서버 API 도 requireAuth 로 이중 차단되어 있어 화면 우회로는 데이터에 접근할 수 없다)
 */
export function AppGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="grid min-h-screen flex-1 place-items-center text-sm text-ink-faint">
        로그인 확인 중...
      </div>
    );
  }
  if (!user) return null;

  return <>{children}</>;
}
