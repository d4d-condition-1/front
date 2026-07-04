"use client";

import Link from "next/link";

import { Badge, Button, Icon, ProgressBar } from "@/components/ui";
import { getCategory } from "@/features/categories";
import type { TrainingQuestion } from "../api/trainingApi";
import { useSession } from "../hooks/useSession";
import { Choice } from "./Choice";
import { SessionResult } from "./SessionResult";

interface SessionRunnerProps {
  title: string;
  questions: TrainingQuestion[];
  exitHref: string;
  ctaHref: string;
  ctaLabel: string;
}

/** 진단/훈련 세션 화면 전체 (상황 → 선택 → 제출 → 피드백 → 다음). */
export function SessionRunner({ title, questions, exitHref, ctaHref, ctaLabel }: SessionRunnerProps) {
  const s = useSession(questions);

  if (s.done) {
    return (
      <SessionResult
        title={title}
        correctCount={s.correctCount}
        total={s.total}
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
          <Link href={exitHref} className="text-slate-400 hover:text-slate-600">
            <Icon name="x" size={22} />
          </Link>
          <span className="text-sm font-semibold text-slate-700">{cat.name}</span>
          <Badge tone="indigo">Lv.{q.difficulty}</Badge>
          <span className="ml-auto text-sm font-semibold text-indigo-600">
            {s.index + 1}/{s.total}
          </span>
        </div>
        <ProgressBar value={((s.index + (s.revealed ? 1 : 0)) / s.total) * 100} />
      </header>

      {/* 문항 */}
      <div className="flex-1 px-5 py-4">
        {q.situation && (
          <div className="mb-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="mb-1 text-xs font-bold text-slate-400">[상황]</p>
            <p className="text-sm leading-relaxed text-slate-700">{q.situation}</p>
          </div>
        )}

        <p className="mb-5 text-[15px] font-semibold leading-relaxed text-slate-900">{q.question}</p>

        <div className="flex flex-col gap-2.5">
          {q.options.map((opt, i) => (
            <Choice
              key={i}
              label={opt}
              index={i}
              selected={s.selected === i}
              revealed={s.revealed}
              isAnswer={q.answerIndex === i}
              onClick={() => s.select(i)}
            />
          ))}
        </div>

        {/* 피드백 */}
        {s.revealed && s.feedback && (
          <div className="mt-4 flex flex-col gap-3">
            <div
              className={`flex items-center gap-2 text-sm font-bold ${
                s.feedback.isCorrect ? "text-emerald-600" : "text-red-500"
              }`}
            >
              <Icon name={s.feedback.isCorrect ? "check" : "x"} size={18} />
              {s.feedback.isCorrect ? "정답" : "오답"}
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
              <p className="mb-1 text-xs font-bold text-indigo-600">해설</p>
              <p className="text-sm leading-relaxed text-slate-700">{q.explanation}</p>
              <p className="mt-2 text-xs text-slate-400">출처: {q.reference}</p>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white">
              <span className="text-slate-300">{cat.name} 점수</span>
              <span className="font-bold">
                {s.feedback.before} → {s.feedback.after}{" "}
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
      <footer className="sticky bottom-0 border-t border-slate-100 bg-white px-5 py-3">
        {s.revealed ? (
          <Button size="lg" onClick={s.next}>
            {s.isLast ? "결과 보기" : "다음 문항"}
          </Button>
        ) : (
          <Button size="lg" disabled={s.selected == null} onClick={s.check}>
            제출
          </Button>
        )}
      </footer>
    </div>
  );
}
