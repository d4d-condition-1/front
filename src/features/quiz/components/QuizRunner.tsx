"use client";

import Link from "next/link";

import { Badge, Button, Icon, ProgressBar } from "@/components/ui";
import type { Question } from "@/features/materials";
import { useQuiz } from "../hooks/useQuiz";
import { ChoiceButton } from "./ChoiceButton";
import { QuizResult } from "./QuizResult";

interface QuizRunnerProps {
  title: string;
  questions: Question[];
}

/** 문제 풀이 화면 전체(진행바 + 문항 + 선택지 + 해설 + 하단 버튼). */
export function QuizRunner({ title, questions }: QuizRunnerProps) {
  const quiz = useQuiz(questions);

  if (quiz.done) {
    return <QuizResult correct={quiz.correctCount} total={quiz.total} onRestart={quiz.restart} />;
  }

  const q = quiz.current;

  return (
    <div className="flex min-h-full flex-col">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-background/95 px-5 pb-3 pt-4 backdrop-blur">
        <div className="mb-3 flex items-center gap-3">
          <Link href="/app/learn" className="text-slate-400 hover:text-slate-600">
            <Icon name="x" size={22} />
          </Link>
          <span className="truncate text-sm font-medium text-slate-500">{title}</span>
          <span className="ml-auto text-sm font-semibold text-indigo-600">
            {quiz.index + 1}/{quiz.total}
          </span>
        </div>
        <ProgressBar value={((quiz.index + (quiz.revealed ? 1 : 0)) / quiz.total) * 100} />
      </header>

      {/* 문항 */}
      <div className="flex-1 px-5 py-4">
        <Badge tone="indigo" className="mb-3">
          {q.part}
        </Badge>

        {q.passage && (
          <div className="mb-4 rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
            {q.passage}
          </div>
        )}

        <p className="mb-5 text-[15px] font-semibold leading-relaxed text-slate-900">
          {q.prompt}
        </p>

        <div className="flex flex-col gap-2.5">
          {q.choices.map((choice, i) => (
            <ChoiceButton
              key={i}
              label={choice}
              index={i}
              selected={quiz.selected === i}
              revealed={quiz.revealed}
              isAnswer={q.answerIndex === i}
              onClick={() => quiz.select(i)}
            />
          ))}
        </div>

        {quiz.revealed && (
          <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
            <p className="mb-1 text-xs font-bold text-indigo-600">해설</p>
            <p className="text-sm leading-relaxed text-slate-700">{q.explanation}</p>
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <footer className="sticky bottom-0 border-t border-slate-100 bg-white px-5 py-3">
        {quiz.revealed ? (
          <Button size="lg" onClick={quiz.next}>
            {quiz.isLast ? "결과 보기" : "다음 문제"}
          </Button>
        ) : (
          <Button size="lg" disabled={quiz.selected == null} onClick={quiz.check}>
            정답 확인
          </Button>
        )}
      </footer>
    </div>
  );
}
