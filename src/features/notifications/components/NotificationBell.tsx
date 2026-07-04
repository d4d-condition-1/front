"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useNotifications } from "../hooks/useNotifications";

const typeTone: Record<string, string> = {
  fitness: "bg-emerald-100 text-emerald-700",
  program: "bg-primary-100 text-primary-700",
  assignment: "bg-amber-100 text-amber-700",
  chat: "bg-sky-100 text-sky-700",
  system: "bg-slate-100 text-slate-600",
};

/** 헤더용 알림 벨 — 안읽음 뱃지 + 드롭다운 목록. WS 로 실시간 갱신된다. */
export function NotificationBell({ dark = false }: { dark?: boolean }) {
  const { items, unread, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 바깥 클릭 시 닫기
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) void markAllRead();
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label={`알림 ${unread}건`}
        className={cn(
          "relative grid h-10 w-10 place-items-center rounded-full transition-colors",
          dark ? "text-white hover:bg-white/10" : "text-slate-600 hover:bg-slate-100",
        )}
      >
        <Icon name="bell" size={22} />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-bold text-slate-900">알림</p>
          </div>
          {items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-400">
              새 알림이 없습니다.
            </p>
          ) : (
            <ul className="max-h-96 overflow-y-auto">
              {items.map((n) => {
                const inner = (
                  <div
                    className={cn(
                      "flex gap-3 px-4 py-3 transition-colors hover:bg-slate-50",
                      !n.read && "bg-primary-50/40",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 h-2 w-2 shrink-0 rounded-full",
                        n.read ? "bg-transparent" : "bg-primary-500",
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 text-[10px] font-semibold",
                            typeTone[n.type] ?? typeTone.system,
                          )}
                        >
                          {n.type}
                        </span>
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {n.title}
                        </p>
                      </div>
                      {n.body && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{n.body}</p>
                      )}
                    </div>
                  </div>
                );
                return (
                  <li key={n.id} className="border-b border-slate-50 last:border-0">
                    {n.link ? (
                      <Link href={n.link} onClick={() => setOpen(false)}>
                        {inner}
                      </Link>
                    ) : (
                      inner
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
