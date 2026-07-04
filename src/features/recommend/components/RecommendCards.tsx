"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Icon, type IconName } from "@/components/ui";
import { cn } from "@/lib/utils";
import { fetchRecommendations, type RecommendCard } from "../api/recommendApi";

const meta: Record<
  RecommendCard["type"],
  { icon: IconName; tone: string; label: string }
> = {
  knowledge: { icon: "target", tone: "bg-primary-100 text-primary-700", label: "지식" },
  fitness: { icon: "dumbbell", tone: "bg-emerald-100 text-emerald-700", label: "체력" },
  assignment: { icon: "book", tone: "bg-amber-100 text-amber-700", label: "과제" },
};

/** 홈 상단의 데이터 기반 추천 피드 (산타토익식). 서버 /api/me/recommendations. */
export function RecommendCards() {
  const [cards, setCards] = useState<RecommendCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchRecommendations()
      .then((r) => active && setCards(r.cards))
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading || cards.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Icon name="flame" size={18} className="text-primary-600" />
        <h2 className="text-sm font-bold text-ink">오늘의 추천 훈련</h2>
      </div>

      <div className="flex flex-col gap-2.5">
        {cards.map((c, i) => {
          const m = meta[c.type];
          return (
            <Link
              key={i}
              href={c.link}
              className="flex items-center gap-3 rounded-2xl bg-surface p-4 ring-1 ring-line transition-colors hover:bg-surface-2"
            >
              <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", m.tone)}>
                <Icon name={m.icon} size={22} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">{c.title}</p>
                <p className="truncate text-xs text-ink-muted">{c.reason}</p>
              </div>
              <span className="flex shrink-0 items-center gap-0.5 text-sm font-semibold text-primary-600">
                {c.cta}
                <Icon name="chevronRight" size={16} />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
