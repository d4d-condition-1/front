import type { ReactNode } from "react";

import { AppTabBar } from "@/components/layout";

/** 하단 탭이 있는 화면(홈/학습/리포트/프로필)용 레이아웃. */
export default function TabsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <main className="flex-1">{children}</main>
      <AppTabBar />
    </>
  );
}
