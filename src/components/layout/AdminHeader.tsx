import type { ReactNode } from "react";

/** 관리자 페이지 상단 헤더 (제목 + 설명 + 우측 액션). */
export function AdminHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5 md:px-8">
      <div>
        <h1 className="text-lg font-bold text-slate-900">{title}</h1>
        {description && <p className="mt-0.5 text-sm text-slate-400">{description}</p>}
      </div>
      {action}
    </header>
  );
}
