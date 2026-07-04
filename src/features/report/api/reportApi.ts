// 프론트 전용 mock: 학습 통계 + 강점/약점 분석.
import {
  getCategory,
  getMyScores,
  levelForScore,
  type CategoryScore,
} from "@/features/categories";

export interface TrainingStats {
  totalSolved: number;
  avgResponseSec: number;
  bestStreak: number;
  overallAccuracy: number;
}

export function getTrainingStats(): TrainingStats {
  const scores = getMyScores();
  const attempts = scores.reduce((s, c) => s + c.attempts, 0);
  const correct = scores.reduce((s, c) => s + c.correct, 0);
  return {
    totalSolved: attempts,
    avgResponseSec: 24,
    bestStreak: 12,
    overallAccuracy: Math.round((correct / attempts) * 100),
  };
}

export interface Analysis {
  strength: { name: string; score: number; note: string };
  weakness: { name: string; score: number; note: string };
  recommendation: string;
}

export function getAnalysis(): Analysis {
  const scores = getMyScores();
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const top = sorted[0];
  const bottom = sorted[sorted.length - 1];
  const need = 60 - bottom.score;
  const est = Math.max(4, Math.ceil(need / 5));

  return {
    strength: {
      name: getCategory(top.code).name,
      score: top.score,
      note: `${getCategory(top.code).description} 영역을 정확히 이해하고 있습니다.`,
    },
    weakness: {
      name: getCategory(bottom.code).name,
      score: bottom.score,
      note: `${getCategory(bottom.code).description}에서 반복적으로 오답이 발생합니다.`,
    },
    recommendation: `${getCategory(bottom.code).name} Lv.${levelForScore(
      bottom.score,
    )} 집중 풀이 (예상 ${est}문항으로 60점 도달 가능)`,
  };
}

/** 레이더 차트용 데이터 변환 */
export function toRadarData(scores: CategoryScore[]) {
  return scores.map((s) => ({ label: getCategory(s.code).name.slice(0, 2), value: s.score }));
}
