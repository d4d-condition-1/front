"use client";

import { useState } from "react";

import { AdminStatus } from "@/features/admin-dashboard";
import { useQuestions } from "../hooks/useQuestions";
import type { AdminQuestion, QuestionInput } from "../api/questionApi";
import { QuestionList } from "./QuestionList";
import { QuestionFormPanel } from "./QuestionFormPanel";

/** 관리자 문제 은행: 출처 학습자료로 출제 + 카테고리별 관리. 활성 문제는 훈련에 자동 출제·채점된다. */
export function QuestionsManager() {
  const { questions, loading, error, create, update, toggle, remove } =
    useQuestions();

  const [editingQuestion, setEditingQuestion] = useState<AdminQuestion | null>(null);

  if (loading) return <AdminStatus message="문제 은행을 불러오는 중..." />;
  if (error) return <AdminStatus message={error.message} isError />;

  function startEdit(q: AdminQuestion) {
    setEditingQuestion(q);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSave(input: QuestionInput, editingId?: string) {
    if (editingId) await update(editingId, input);
    else await create(input);
    setEditingQuestion(null);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      <QuestionList
        questions={questions}
        onEdit={startEdit}
        onToggle={toggle}
        onRemove={remove}
      />
      <QuestionFormPanel
        editingQuestion={editingQuestion}
        onSave={handleSave}
        onCancelEdit={() => setEditingQuestion(null)}
      />
    </div>
  );
}
