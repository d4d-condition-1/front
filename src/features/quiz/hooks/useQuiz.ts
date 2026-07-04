"use client";

import { useMemo, useState } from "react";

import type { Question } from "@/features/materials";

export interface QuizState {
  current: Question;
  index: number;
  total: number;
  selected: number | null;
  revealed: boolean;
  isLast: boolean;
  done: boolean;
  correctCount: number;
  answers: (number | null)[];
  select: (choice: number) => void;
  check: () => void;
  next: () => void;
  restart: () => void;
}

/** 문제 풀이 상태 관리. 선택 → 정답 확인 → 다음 흐름을 캡슐화. */
export function useQuiz(questions: Question[]): QuizState {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    questions.map(() => null),
  );
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);

  const current = questions[index];
  const selected = answers[index];
  const isLast = index === questions.length - 1;

  const correctCount = useMemo(
    () => answers.filter((a, i) => a === questions[i].answerIndex).length,
    [answers, questions],
  );

  function select(choice: number) {
    if (revealed) return;
    setAnswers((prev) => prev.map((a, i) => (i === index ? choice : a)));
  }

  function check() {
    if (selected != null) setRevealed(true);
  }

  function next() {
    if (isLast) {
      setDone(true);
      return;
    }
    setRevealed(false);
    setIndex((i) => i + 1);
  }

  function restart() {
    setIndex(0);
    setAnswers(questions.map(() => null));
    setRevealed(false);
    setDone(false);
  }

  return {
    current,
    index,
    total: questions.length,
    selected,
    revealed,
    isLast,
    done,
    correctCount,
    answers,
    select,
    check,
    next,
    restart,
  };
}
