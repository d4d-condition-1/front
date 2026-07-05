"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Icon, type IconName } from "@/components/ui";
import { cn } from "@/lib/utils";

const items: { href: string; label: string; icon: IconName }[] = [
  { href: "/admin", label: "부대 현황", icon: "chart" },
  { href: "/admin/units", label: "부대 관리", icon: "home" },
  { href: "/admin/users", label: "장병 관리", icon: "users" },
  { href: "/admin/categories", label: "카테고리", icon: "target" },
  { href: "/admin/questions", label: "문제 은행", icon: "book" },
  { href: "/admin/programs", label: "커리큘럼", icon: "list" },
  { href: "/admin/accounts", label: "계정/권한", icon: "settings" },
  { href: "/admin/ai", label: "AI 연동", icon: "cpu" },
  { href: "/admin/materials", label: "학습 자료", icon: "book" },
  { href: "/admin/feeds", label: "정보 수집", icon: "rss" },
];

function NavContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <>
      <Link href="/admin" className="mb-8 flex items-center gap-2 px-2" onClick={onNavigate}>
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-600 text-sm font-bold text-white">
          D4D
        </span>
        <span className="font-bold text-ink">Admin</span>
      </Link>

      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary-50 text-primary-700"
                  : "text-ink-muted hover:bg-surface-2 hover:text-ink",
              )}
            >
              <Icon name={item.icon} size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/"
        onClick={onNavigate}
        className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-faint hover:bg-surface-2"
      >
        <Icon name="logout" size={20} />
        나가기
      </Link>
    </>
  );
}

/** 관리자 콘솔 사이드바 + 모바일 햄버거 메뉴. */
export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 데스크톱 사이드바 */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-surface px-4 py-6 md:flex">
        <NavContent pathname={pathname} />
      </aside>

      {/* 모바일 상단 바 */}
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-line bg-surface px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="grid h-9 w-9 place-items-center rounded-lg text-ink hover:bg-surface-2"
        >
          <Icon name="list" size={22} />
        </button>
        <span className="text-sm font-bold text-ink">D4D Admin</span>
      </div>

      {/* 모바일 슬라이드 메뉴 */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-surface px-4 py-6 shadow-xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mb-4 self-end rounded-lg p-1.5 text-ink-faint hover:bg-surface-2"
            >
              <Icon name="x" size={20} />
            </button>
            <NavContent pathname={pathname} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
