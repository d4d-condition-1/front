import Link from "next/link";

import { Button, Card, ProgressRing } from "@/components/ui";

interface QuizResultProps {
  correct: number;
  total: number;
  onRestart: () => void;
}

/** 풀이 완료 결과 요약. */
export function QuizResult({ correct, total, onRestart }: QuizResultProps) {
  const accuracy = Math.round((correct / total) * 100);
  const message =
    accuracy >= 80 ? "훌륭해요! 👏" : accuracy >= 50 ? "좋아요, 조금만 더!" : "복습이 필요해요 💪";

  return (
    <div className="flex flex-col items-center gap-6 px-5 py-10">
      <div className="text-center">
        <p className="text-sm font-medium text-indigo-600">학습 완료</p>
        <h2 className="mt-1 text-xl font-bold text-slate-900">{message}</h2>
      </div>

      <Card className="flex w-full flex-col items-center gap-4 py-8">
        <ProgressRing value={accuracy} label={`${accuracy}%`} sublabel="정답률" />
        <div className="flex gap-8 text-center">
          <div>
            <p className="text-2xl font-bold text-emerald-600">{correct}</p>
            <p className="text-xs text-slate-400">맞은 개수</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-300">{total - correct}</p>
            <p className="text-xs text-slate-400">틀린 개수</p>
          </div>
        </div>
      </Card>

      <div className="flex w-full flex-col gap-2">
        <Link href="/app/report">
          <Button size="lg">내 리포트 보기</Button>
        </Link>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onRestart}>
            다시 풀기
          </Button>
          <Link href="/app/learn" className="flex-1">
            <Button variant="ghost" className="w-full">
              목록으로
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
