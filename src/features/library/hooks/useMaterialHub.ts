"use client";

import { useCallback, useEffect, useState } from "react";

import {
  fetchMaterial,
  updateLibraryItem,
  type MaterialDetail,
} from "../api/libraryApi";
import {
  createQuestion,
  deleteQuestion,
  fetchMaterialQuestions,
  updateQuestion,
  type AdminQuestion,
  type QuestionInput,
} from "../api/questionApi";

/** 자료 상세: 자료 본문 + 그 자료의 문제 목록을 로드·관리한다. */
export function useMaterialHub(id: string) {
  const [material, setMaterial] = useState<MaterialDetail | null>(null);
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([fetchMaterial(id), fetchMaterialQuestions(id)])
      .then(([m, qs]) => {
        if (!active) return;
        setMaterial(m);
        setQuestions(qs);
      })
      .catch((e) => active && setError(e instanceof Error ? e.message : "불러오기 실패"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  const saveBody = useCallback(
    async (body: string) => {
      await updateLibraryItem(id, { body });
      setMaterial((prev) =>
        prev ? { ...prev, body, hasBody: Boolean(body.trim()) } : prev,
      );
    },
    [id],
  );

  /** 문제 저장 (editingId 있으면 수정, 없으면 신규) */
  const saveQuestion = useCallback(
    async (input: QuestionInput, editingId?: string) => {
      if (editingId) {
        const updated = await updateQuestion(editingId, input);
        setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
      } else {
        const created = await createQuestion(input);
        setQuestions((prev) => [created, ...prev]);
      }
    },
    [],
  );

  const toggleQuestion = useCallback(async (q: AdminQuestion) => {
    const updated = await updateQuestion(q.id, { active: !q.active });
    setQuestions((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
  }, []);

  const removeQuestion = useCallback(async (qid: string) => {
    await deleteQuestion(qid);
    setQuestions((prev) => prev.filter((q) => q.id !== qid));
  }, []);

  const updateMaterial = useCallback((updated: MaterialDetail) => {
    setMaterial(updated);
  }, []);

  return {
    material,
    questions,
    loading,
    error,
    saveBody,
    updateMaterial,
    saveQuestion,
    toggleQuestion,
    removeQuestion,
  };
}
