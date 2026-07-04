// 훈련 세션 — 서버가 문항을 출제하고 채점한다 (정답/해설은 제출 후에만 내려온다).
import { apiFetch } from "@/lib/api";
import type { CategoryCode } from "@/features/categories";

export type QType = "multiple_choice" | "situational";
export type TrainingMode = "diagnostic" | "adaptive";

/** 서버가 내려주는 문항 (정답 index·해설 제외) */
export interface SessionQuestion {
  id: string;
  category: CategoryCode;
  difficulty: number;
  type: QType;
  situation?: string;
  question: string;
  options: string[];
  points: number;
  imageData?: string | null;
  videoData?: string | null;
}

export interface StartSessionResult {
  sessionId: string;
  mode: TrainingMode;
  questions: SessionQuestion[];
}

export interface CategoryScoreRow {
  code: CategoryCode;
  score: number;
  attempts: number;
  correct: number;
}

export interface SessionSummary {
  correctCount: number;
  answered: number;
  total: number;
  grade: string;
  scores: CategoryScoreRow[];
}

/** 답안 제출 응답 (서버 채점 결과) */
export interface AnswerResult {
  correct: boolean;
  answerIndex: number;
  explanation: string;
  reference: string;
  delta: number;
  category: CategoryCode;
  score: number; // 해당 카테고리의 갱신된 점수
  done: boolean;
  summary?: SessionSummary;
}

export interface AvailableCategory {
  code: CategoryCode;
  name: string;
  color: string;
  questionCount: number;
  userScore: number;
}

export function fetchAvailableTrainings(): Promise<{ categories: AvailableCategory[] }> {
  return apiFetch("/api/training/available");
}

/** 세션 시작 → 문항 목록 (출제 가능한 문항이 없으면 503) */
export function startSession(mode: TrainingMode, category?: CategoryCode): Promise<StartSessionResult> {
  return apiFetch<StartSessionResult>("/api/training/sessions", {
    method: "POST",
    body: JSON.stringify({ mode, ...(category ? { category } : {}) }),
  });
}

/** 답안 제출 → 채점/해설/점수 */
export function submitAnswer(
  sessionId: string,
  questionId: string,
  selectedIndex: number,
  elapsedSec?: number,
): Promise<AnswerResult> {
  return apiFetch<AnswerResult>(`/api/training/sessions/${sessionId}/answers`, {
    method: "POST",
    body: JSON.stringify({ questionId, selectedIndex, elapsedSec }),
  });
}
