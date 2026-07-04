import type { ReactNode } from "react";

import { AdminSidebar } from "@/components/layout";

/** 관리자 콘솔 레이아웃 (사이드바 + 본문). */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
