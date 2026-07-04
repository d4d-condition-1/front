"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge, Button, Card, Icon, Spinner } from "@/components/ui";
import { gradeOf } from "@/features/categories";
import { fetchAvailableTrainings, type AvailableCategory } from "@/features/training";

function ScoreBadge({ score }: { score: number }) {
  const grade = gradeOf(score);
  const tone =
    grade === "S"
      ? "primary"
      : grade === "A" || grade === "B"
        ? "green"
        : grade === "C"
          ? "amber"
          : "slate";
  return (
    <Badge tone={tone}>
      {grade} · {score}점
    </Badge>
  );
}

export default function TrainingLobbyPage() {
  const [categories, setCategories] = useState<AvailableCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableTrainings()
      .then((r) => setCategories(r.categories))
      .catch((e) => setError(e instanceof Error ? e.message : "불러오기 실패"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-5 px-5 pb-6 pt-6">
      <header>
        <p className="text-sm text-ink-faint">전투 역량 훈련</p>
        <h1 className="text-xl font-bold text-ink">훈련 선택</h1>
      </header>

      {/* 전체 적응형 훈련 */}
      <Link href="/app/training/session?mode=adaptive">
        <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 p-5 text-white shadow-sm active:scale-[0.98]">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/20 backdrop-blur">
            <Icon name="target" size={26} />
          </div>
          <div className="flex-1">
            <p className="font-bold">전체 적응형 훈련</p>
            <p className="text-sm text-primary-100">약점 영역을 자동으로 파악해 출제</p>
          </div>
          <Icon name="chevronRight" size={20} className="text-white/60" />
        </div>
      </Link>

      {loading && (
        <div className="grid place-items-center py-12 text-primary-600">
          <Spinner size={24} />
        </div>
      )}

      {error && (
        <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>
      )}

      {!loading && categories.length === 0 && !error && (
        <Card className="flex flex-col items-center gap-2 py-10 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-surface-2 text-ink-faint">
            <Icon name="book" size={24} />
          </div>
          <p className="text-sm text-ink-faint">
            아직 출제 가능한 문항이 없습니다.<br />
            관리자가 자료에 문제를 등록하면 여기에 나타납니다.
          </p>
        </Card>
      )}

      {categories.length > 0 && (
        <>
          <p className="text-sm font-semibold text-ink-muted">영역별 훈련</p>
          <div className="flex flex-col gap-3">
            {categories.map((cat) => (
              <Card key={cat.code} className="flex items-center gap-4">
                <div
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-sm font-bold text-white"
                  style={{ backgroundColor: cat.color }}
                >
                  {cat.code}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{cat.name}</p>
                  <p className="text-xs text-ink-faint">{cat.questionCount}문항</p>
                </div>
                <div className="flex items-center gap-2">
                  <ScoreBadge score={cat.userScore} />
                  <Link
                    href={`/app/training/session?mode=adaptive&category=${cat.code}&name=${encodeURIComponent(cat.name)}`}
                  >
                    <Button size="sm">시작</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
