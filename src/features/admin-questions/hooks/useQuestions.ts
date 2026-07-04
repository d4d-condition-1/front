"use client";

import { useEffect, useState } from "react";

import {
  createQuestion,
  deleteQuestion,
  fetchQuestions,
  setQuestionActive,
  updateQuestion,
  type AdminQuestion,
  type QuestionInput,
} from "../api/questionApi";

interface UseQuestionsResult {
  questions: AdminQuestion[];
  loading: boolean;
  error: Error | null;
  create: (input: QuestionInput) => Promise<void>;
  update: (id: string, input: QuestionInput) => Promise<void>;
  toggle: (q: AdminQuestion) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useQuestions(): UseQuestionsResult {
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    fetchQuestions()
      .then((data) => active && setQuestions(data))
      .catch((err) => active && setError(err as Error))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  async function create(input: QuestionInput) {
    const created = await createQuestion(input);
    setQuestions((prev) => [created, ...prev]);
  }

  async function update(id: string, input: QuestionInput) {
    const updated = await updateQuestion(id, input);
    setQuestions((prev) => prev.map((q) => (q.id === id ? updated : q)));
  }

  async function toggle(q: AdminQuestion) {
    const updated = await setQuestionActive(q.id, !q.active);
    setQuestions((prev) => prev.map((x) => (x.id === q.id ? updated : x)));
  }

  async function remove(id: string) {
    const res = await deleteQuestion(id);
    if (res && "deactivated" in res) {
      // 답안 이력이 있어 비활성화만 됨 → 목록에서 active=false 로 반영
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, active: false } : q)),
      );
    } else {
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    }
  }

  return { questions, loading, error, create, update, toggle, remove };
}
