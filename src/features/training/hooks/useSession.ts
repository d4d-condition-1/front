"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  startSession,
  submitAnswer,
  type AnswerResult,
  type SessionQuestion,
  type SessionSummary,
  type TrainingMode,
} from "../api/trainingApi";

/**
 * 서버 기반 훈련 세션 상태.
 * - 시작 시 서버가 문항을 출제(정답 제외)한다.
 * - 제출하면 서버가 채점해 정답·해설·점수 변동을 돌려준다.
 */
export function useSession(mode: TrainingMode) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<SessionQuestion[]>([]);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [feedback, setFeedback] = useState<AnswerResult | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [summary, setSummary] = useState<SessionSummary | null>(null);

  const shownAt = useRef<number>(0);

  useEffect(() => {
    let active = true;
    startSession(mode)
      .then((res) => {
        if (!active) return;
        setSessionId(res.sessionId);
        setQuestions(res.questions);
        shownAt.current = Date.now();
      })
      .catch((e) => active && setError(e instanceof Error ? e.message : "세션을 시작할 수 없습니다."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [mode]);

  const current = questions[index];
  const total = questions.length;
  const isLast = index === total - 1;

  const select = useCallback(
    (i: number) => {
      if (!revealed && !submitting) setSelected(i);
    },
    [revealed, submitting],
  );

  const check = useCallback(async () => {
    if (selected == null || revealed || submitting || !sessionId || !current) return;
    setSubmitting(true);
    setError(null);
    const elapsedSec = Math.max(0, Math.round((Date.now() - shownAt.current) / 1000));
    try {
      const res = await submitAnswer(sessionId, current.id, selected, elapsedSec);
      setFeedback(res);
      setRevealed(true);
      if (res.correct) setCorrectCount((c) => c + 1);
      if (res.summary) setSummary(res.summary);
    } catch (e) {
      setError(e instanceof Error ? e.message : "채점에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }, [selected, revealed, submitting, sessionId, current]);

  const next = useCallback(() => {
    if (isLast) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
    setFeedback(null);
    shownAt.current = Date.now();
  }, [isLast]);

  return {
    loading,
    error,
    current,
    index,
    total,
    isLast,
    selected,
    revealed,
    submitting,
    feedback,
    correctCount,
    done,
    summary,
    select,
    check,
    next,
  };
}
