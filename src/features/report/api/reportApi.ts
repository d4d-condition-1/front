// 학습 리포트 — 서버가 통계·강점/약점 분석을 계산한다. (/api/report)
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

export interface ReportData {
  stats: TrainingStats;
  analysis: Analysis | null; // 풀이 이력이 없으면 null
  scores: { code: CategoryCode; score: number; attempts: number; correct: number }[];
}

export function fetchReport(): Promise<ReportData> {
  return apiFetch<ReportData>("/api/report");
}

/** 레이더 차트용 데이터 변환 (카테고리 점수 → {label, value}) */
export function toRadarData(scores: Pick<CategoryScore, "code" | "score">[]) {
  return scores.map((s) => ({ label: getCategory(s.code).name.slice(0, 2), value: s.score }));
}
