// 문제 은행 관리 (관리자용, 서버 /api/admin/questions)
import { apiFetch } from "@/lib/api";
import type { CategoryCode } from "@/features/categories";

export type QType = "multiple_choice" | "situational";

export interface AdminQuestion {
  id: string;
  category: CategoryCode;
  difficulty: number; // 1~5
  type: QType;
  situation: string | null;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  reference: string;
  points: number;
  active: boolean;
  materialId: string | null; // 출처 학습자료
  materialTitle: string | null;
}

export interface QuestionInput {
  category: CategoryCode;
  type: QType;
  situation?: string;
  question: string;
  options: string[];
  answerIndex: number;
  difficulty: number;
  points: number;
  explanation?: string;
  reference?: string;
  /** 출처 학습자료. 지정하면 카테고리는 자료를 따른다. null = 자료 없음(직접 지정) */
  materialId?: string | null;
}

export function fetchQuestions(materialId?: string): Promise<AdminQuestion[]> {
  const qs = materialId ? `?materialId=${encodeURIComponent(materialId)}` : "";
  return apiFetch<AdminQuestion[]>(`/api/admin/questions${qs}`);
}

export function createQuestion(input: QuestionInput): Promise<AdminQuestion> {
  return apiFetch<AdminQuestion>("/api/admin/questions", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateQuestion(
  id: string,
  input: QuestionInput,
): Promise<AdminQuestion> {
  return apiFetch<AdminQuestion>(`/api/admin/questions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

/** 활성/비활성 토글 (active 만 보내면 서버가 토글 처리) */
export function setQuestionActive(
  id: string,
  active: boolean,
): Promise<AdminQuestion> {
  return apiFetch<AdminQuestion>(`/api/admin/questions/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ active }),
  });
}

/** 삭제. 답안 이력이 있으면 서버가 비활성화만 하고 {deactivated:true} 반환 */
export function deleteQuestion(
  id: string,
): Promise<void | { deactivated: boolean }> {
  return apiFetch<void | { deactivated: boolean }>(
    `/api/admin/questions/${id}`,
    { method: "DELETE" },
  );
}
