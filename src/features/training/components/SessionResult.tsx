import Link from "next/link";

import { Button, Card, ProgressRing } from "@/components/ui";

interface SessionResultProps {
  title: string;
  correctCount: number;
  total: number;
  grade?: string;
  ctaHref: string;
  ctaLabel: string;
  onRestart?: () => void;
}

/** 세션(진단/훈련) 완료 결과. */
export function SessionResult({
  title,
  correctCount,
  total,
  grade,
  ctaHref,
  ctaLabel,
  onRestart,
}: SessionResultProps) {
  const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  return (
    <div className="flex flex-col items-center gap-6 px-5 py-10">
      <div className="text-center">
        <p className="text-sm font-medium text-primary-600">{title}</p>
        <h2 className="mt-1 text-xl font-bold text-slate-900">세션 완료</h2>
        {grade && (
          <p className="mt-2 inline-block rounded-full bg-primary-50 px-3 py-1 text-sm font-bold text-primary-700">
            종합 등급 {grade}
          </p>
        )}
      </div>

      <Card className="flex w-full flex-col items-center gap-4 py-8">
        <ProgressRing value={accuracy} label={`${accuracy}%`} sublabel="정답률" />
        <div className="flex gap-8 text-center">
          <div>
            <p className="text-2xl font-bold text-emerald-600">{correctCount}</p>
            <p className="text-xs text-slate-400">정답</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-300">{total - correctCount}</p>
            <p className="text-xs text-slate-400">오답</p>
          </div>
        </div>
      </Card>

      <div className="flex w-full flex-col gap-2">
        <Link href={ctaHref}>
          <Button size="lg">{ctaLabel}</Button>
        </Link>
        {onRestart && (
          <Button variant="secondary" onClick={onRestart}>
            다시 하기
          </Button>
        )}
      </div>
    </div>
  );
}
