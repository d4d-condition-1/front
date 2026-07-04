"use client";

import Link from "next/link";

import { Badge, Button, Icon, ProgressBar, Spinner } from "@/components/ui";
import { getCategory, type CategoryCode } from "@/features/categories";
import type { TrainingMode } from "../api/trainingApi";
import { useSession } from "../hooks/useSession";
import { Choice } from "./Choice";
import { SessionResult } from "./SessionResult";

interface SessionRunnerProps {
  title: string;
  mode: TrainingMode;
  category?: CategoryCode;
  exitHref: string;
  ctaHref: string;
  ctaLabel: string;
}

/** 진단/훈련 세션 화면 전체. 문항 출제·채점은 서버가 담당한다. */
export function SessionRunner({ title, mode, category, exitHref, ctaHref, ctaLabel }: SessionRunnerProps) {
  const s = useSession(mode, category);

  // 로딩
  if (s.loading) {
    return (
      <div className="grid min-h-full flex-1 place-items-center py-24 text-primary-600">
        <Spinner size={28} />
      </div>
    );
  }

  // 에러 / 출제 가능한 문항 없음 (관리자가 아직 문항을 등록하지 않음)
  if (s.error || s.total === 0) {
    return (
      <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-4 px-8 py-24 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-surface-2 text-ink-faint">
          <Icon name="book" size={26} />
        </div>
        <p className="text-sm text-ink-muted">
          {s.error ?? "아직 출제 가능한 문항이 없습니다.\n관리자가 문항을 등록하면 훈련을 시작할 수 있습니다."}
        </p>
        <Link href={exitHref}>
          <Button variant="secondary">돌아가기</Button>
        </Link>
      </div>
    );
  }

  if (s.done) {
    return (
      <SessionResult
        title={title}
        correctCount={s.summary?.correctCount ?? s.correctCount}
        total={s.total}
        grade={s.summary?.grade}
        ctaHref={ctaHref}
        ctaLabel={ctaLabel}
      />
    );
  }

  const q = s.current;
  const cat = getCategory(q.category);

  return (
    <div className="flex min-h-full flex-col">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-background/95 px-5 pb-3 pt-4 backdrop-blur">
        <div className="mb-3 flex items-center gap-3">
          <Link href={exitHref} className="text-ink-faint hover:text-ink">
            <Icon name="x" size={22} />
          </Link>
          <span className="text-sm font-semibold text-ink">{cat.name}</span>
          <Badge tone="primary">Lv.{q.difficulty}</Badge>
          <span className="ml-auto text-sm font-semibold text-primary-600">
            {s.index + 1}/{s.total}
          </span>
        </div>
        <ProgressBar value={((s.index + (s.revealed ? 1 : 0)) / s.total) * 100} />
      </header>

      {/* 문항 */}
      <div className="flex-1 px-5 py-4">
        {q.situation && (
          <div className="mb-4 rounded-2xl border border-line bg-bg p-4">
            <p className="mb-1 text-xs font-bold text-ink-faint">[상황]</p>
            <p className="text-sm leading-relaxed text-ink">{q.situation}</p>
          </div>
        )}

        <p className="mb-5 text-[15px] font-semibold leading-relaxed text-ink">{q.question}</p>

        <div className="flex flex-col gap-2.5">
          {q.options.map((opt, i) => (
            <Choice
              key={i}
              label={opt}
              index={i}
              selected={s.selected === i}
              revealed={s.revealed}
              isAnswer={s.feedback?.answerIndex === i}
              onClick={() => s.select(i)}
            />
          ))}
        </div>

        {/* 피드백 (서버 채점 결과) */}
        {s.revealed && s.feedback && (
          <div className="mt-4 flex flex-col gap-3">
            <div
              className={`flex items-center gap-2 text-sm font-bold ${
                s.feedback.correct ? "text-emerald-600" : "text-red-500"
              }`}
            >
              <Icon name={s.feedback.correct ? "check" : "x"} size={18} />
              {s.feedback.correct ? "정답" : "오답"}
            </div>

            <div className="rounded-2xl border border-primary-100 bg-primary-50/60 p-4">
              <p className="mb-1 text-xs font-bold text-primary-600">해설</p>
              <p className="text-sm leading-relaxed text-ink">{s.feedback.explanation}</p>
              {s.feedback.reference && (
                <p className="mt-2 text-xs text-ink-faint">출처: {s.feedback.reference}</p>
              )}
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-surface-2 px-4 py-3 text-sm text-white">
              <span className="text-ink-faint">{cat.name} 점수</span>
              <span className="font-bold">
                {s.feedback.score}점{" "}
                <span className={s.feedback.delta >= 0 ? "text-emerald-400" : "text-red-400"}>
                  ({s.feedback.delta >= 0 ? "+" : ""}
                  {s.feedback.delta})
                </span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <footer className="sticky bottom-0 border-t border-line bg-surface px-5 py-3">
        {s.revealed ? (
          <Button size="lg" onClick={s.next}>
            {s.isLast ? "결과 보기" : "다음 문항"}
          </Button>
        ) : (
          <Button size="lg" loading={s.submitting} disabled={s.selected == null} onClick={s.check}>
            제출
          </Button>
        )}
      </footer>
    </div>
  );
}
