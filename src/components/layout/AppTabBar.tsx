"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon, type IconName } from "@/components/ui";
import { cn } from "@/lib/utils";

const tabs: { href: string; label: string; icon: IconName }[] = [
  { href: "/app", label: "홈", icon: "home" },
  { href: "/app/training", label: "훈련", icon: "target" },
  { href: "/app/fitness", label: "특급전사", icon: "dumbbell" },
  { href: "/app/programs", label: "커리큘럼", icon: "list" },
  { href: "/app/report", label: "리포트", icon: "chart" },
  { href: "/app/profile", label: "프로필", icon: "user" },
];

/** 사용자 앱 하단 탭 내비게이션 (산타토익 스타일). */
export function AppTabBar() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-20 border-t border-line bg-bg/95 backdrop-blur">
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {tabs.map((tab) => {
          const active =
            tab.href === "/app"
              ? pathname === "/app"
              : pathname.startsWith(tab.href);
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-primary-600" : "text-ink-faint",
                )}
              >
                <Icon name={tab.icon} size={24} />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
