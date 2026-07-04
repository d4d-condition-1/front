// 문제 은행 (관리자용, 서버 /api/admin/questions) — 자료 상세 허브에서 자료별 문제 관리
import { apiFetch } from "@/lib/api";
import type { CategoryCode } from "@/features/categories";

export type QType = "multiple_choice" | "situational";

export interface AdminQuestion {
  id: string;
  category: CategoryCode;
  difficulty: number;
  type: QType;
  situation: string | null;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  reference: string;
  points: number;
  active: boolean;
  materialId: string | null;
  materialTitle: string | null;
}

/** 문제 저장 입력 (materialId 지정 시 카테고리는 서버가 자료에서 강제) */
export interface QuestionInput {
  materialId: string;
  type: QType;
  situation: string | null;
  question: string;
  options: string[];
  answerIndex: number;
  difficulty: number;
  points: number;
  explanation: string;
  reference: string;
}

export function fetchMaterialQuestions(materialId: string): Promise<AdminQuestion[]> {
  return apiFetch<AdminQuestion[]>(
    `/api/admin/questions?materialId=${encodeURIComponent(materialId)}`,
  );
}

export function createQuestion(input: QuestionInput): Promise<AdminQuestion> {
  return apiFetch<AdminQuestion>("/api/admin/questions", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateQuestion(
  id: string,
  patch: Partial<QuestionInput> & { active?: boolean },
): Promise<AdminQuestion> {
  return apiFetch<AdminQuestion>(`/api/admin/questions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export function deleteQuestion(id: string): Promise<void> {
  return apiFetch<void>(`/api/admin/questions/${id}`, { method: "DELETE" });
}
