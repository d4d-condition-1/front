"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon, type IconName } from "@/components/ui";
import { cn } from "@/lib/utils";

const items: { href: string; label: string; icon: IconName }[] = [
  { href: "/admin", label: "부대 현황", icon: "chart" },
  { href: "/admin/units", label: "부대 관리", icon: "home" },
  { href: "/admin/users", label: "장병 관리", icon: "users" },
  { href: "/admin/accounts", label: "계정/권한", icon: "settings" },
  { href: "/admin/ai", label: "AI 연동", icon: "cpu" },
  { href: "/admin/materials", label: "학습 자료", icon: "book" },
];

/** 관리자 콘솔 사이드바. */
export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-6 md:flex">
      <Link href="/admin" className="mb-8 flex items-center gap-2 px-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-600 text-sm font-bold text-white">
          D4D
        </span>
        <span className="font-bold text-slate-900">Admin</span>
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
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary-50 text-primary-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
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
        className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-50"
      >
        <Icon name="logout" size={20} />
        나가기
      </Link>
    </aside>
  );
}
