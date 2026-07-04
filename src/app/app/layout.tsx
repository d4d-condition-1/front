import type { ReactNode } from "react";

/** 사용자 앱 모바일 프레임 (가운데 정렬된 좁은 폭 + 앱 배경). */
export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-slate-50 shadow-sm">
      {children}
    </div>
  );
}
