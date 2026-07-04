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
  hasImage: boolean;
  imageData: string | null;
  imagePrompt: string | null;
  hasVideo: boolean;
  videoData: string | null;
  videoPrompt: string | null;
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
  imageData?: string | null;
  imagePrompt?: string | null;
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

/** 문제에 AI 이미지 생성 (OpenAI/Google) */
export function previewQuestionImage(id: string, prompt?: string): Promise<{ imageData: string; imagePrompt: string }> {
  return apiFetch<{ imageData: string; imagePrompt: string }>(`/api/admin/questions/${id}/preview-image`, {
    method: "POST",
    body: JSON.stringify(prompt ? { prompt } : {}),
  });
}

export function applyQuestionImage(id: string, imageData: string, imagePrompt: string): Promise<AdminQuestion> {
  return apiFetch<AdminQuestion>(`/api/admin/questions/${id}/apply-image`, {
    method: "POST",
    body: JSON.stringify({ imageData, imagePrompt }),
  });
}

/** 문제 이미지 삭제 */
export function deleteQuestionImage(id: string): Promise<AdminQuestion> {
  return apiFetch<AdminQuestion>(`/api/admin/questions/${id}/image`, {
    method: "DELETE",
  });
}

/** 자연어로 이미지 편집 */
export function editQuestionImage(id: string, instruction: string): Promise<AdminQuestion> {
  return apiFetch<AdminQuestion>(`/api/admin/questions/${id}/edit-image`, {
    method: "POST",
    body: JSON.stringify({ instruction }),
  });
}

/** 문제에 AI 비디오 생성 */
export function generateQuestionVideo(id: string): Promise<AdminQuestion> {
  return apiFetch<AdminQuestion>(`/api/admin/questions/${id}/generate-video`, {
    method: "POST",
  });
}

/** 문제 비디오 삭제 */
export function deleteQuestionVideo(id: string): Promise<AdminQuestion> {
  return apiFetch<AdminQuestion>(`/api/admin/questions/${id}/video`, {
    method: "DELETE",
  });
}
