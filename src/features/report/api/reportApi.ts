import { apiFetch } from "@/lib/api";
import { getCategory, type CategoryCode, type CategoryScore } from "@/features/categories";

export interface TrainingStats {
  totalSolved: number;
  avgResponseSec: number;
  bestStreak: number;
  overallAccuracy: number;
}

export interface Analysis {
  strength: { name: string; score: number; note: string };
  weakness: { name: string; score: number; note: string };
  recommendation: string;
}

export interface ScoreWithUnit {
  code: CategoryCode;
  name: string;
  color: string;
  score: number;
  attempts: number;
  correct: number;
  unitAvg: number | null;
}

export interface ReportData {
  stats: TrainingStats;
  analysis: Analysis | null;
  scores: ScoreWithUnit[];
  rank: number;
  totalInUnit: number;
}

export function fetchReport(): Promise<ReportData> {
  return apiFetch<ReportData>("/api/report");
}

export function toRadarData(scores: Pick<CategoryScore, "code" | "score">[]) {
  return scores.map((s) => ({ label: getCategory(s.code).name.slice(0, 2), value: s.score }));
}

export interface AnswerDetail {
  id: number;
  correct: boolean;
  selectedIndex: number;
  elapsedSec: number | null;
  createdAt: string;
  category: string;
  categoryName: string;
  difficulty: number;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface WeakCategory {
  code: string;
  name: string;
  color: string;
  total: number;
  wrong: number;
  wrongRate: number;
}

export interface ReportDetail {
  history: AnswerDetail[];
  categories: WeakCategory[];
}

export function fetchReportDetail(): Promise<ReportDetail> {
  return apiFetch<ReportDetail>("/api/report/detail");
}
