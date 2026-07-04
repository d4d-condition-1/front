import type { ReactNode } from "react";

import { AppGuard } from "@/features/auth";
import { AppNavBar } from "@/components/layout";
import { CategoriesLoader } from "@/features/categories";

/** 사용자 앱 모바일 프레임 (가운데 정렬된 좁은 폭 + 앱 배경). 로그인 사용자만 진입 가능. */
export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <AppGuard>
      <CategoriesLoader />
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-bg shadow-sm">
        <AppNavBar />
        {children}
      </div>
    </AppGuard>
  );
}
