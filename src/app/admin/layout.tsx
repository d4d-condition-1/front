import type { ReactNode } from "react";

import { AdminSidebar } from "@/components/layout";
import { AdminGuard } from "@/features/auth";

/** 관리자 콘솔 레이아웃 (사이드바 + 본문). 관리자 role 만 진입 가능. */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen flex-col bg-bg md:flex-row">
        <AdminSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </AdminGuard>
  );
}
