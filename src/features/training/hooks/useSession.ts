"use client";

import { useMemo, useState } from "react";

import { getMyScores, type CategoryCode } from "@/features/categories";
import type { TrainingQuestion } from "../api/trainingApi";

export interface Feedback {
  isCorrect: boolean;
  category: CategoryCode;
  before: number;
  after: number;
  delta: number;
}

/** 진단/훈련 공용 세션 상태. 답변 → 채점 → 점수 변동 → 다음 흐름. */
export function useSession(questions: TrainingQuestion[]) {
  const base = useMemo(() => {
    const map = {} as Record<CategoryCode, number>;
    for (const s of getMyScores()) map[s.code] = s.score;
    return map;
  }, []);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [scores, setScores] = useState<Record<CategoryCode, number>>(base);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  const current = questions[index];
  const total = questions.length;
  const isLast = index === total - 1;

  function select(i: number) {
    if (!revealed) setSelected(i);
  }

  function check() {
    if (selected == null || revealed) return;
    const isCorrect = selected === current.answerIndex;
    const cat = current.category;
    const before = scores[cat];
    const delta = isCorrect ? current.points : -Math.ceil(current.points / 2);
    const after = Math.max(0, Math.min(100, before + delta));
    setScores((prev) => ({ ...prev, [cat]: after }));
    setFeedback({ isCorrect, category: cat, before, after, delta });
    if (isCorrect) setCorrectCount((c) => c + 1);
    setRevealed(true);
  }

  function next() {
    if (isLast) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
    setFeedback(null);
  }

  return {
    current,
    index,
    total,
    isLast,
    selected,
    revealed,
    feedback,
    correctCount,
    scores,
    done,
    select,
    check,
    next,
  };
}
