// 프론트 전용 mock 통계 데이터.
export interface PartAccuracy {
  part: string;
  accuracy: number; // 0~100
}

export interface Stats {
  predictedScore: number; // 예상 점수 (990 만점)
  lcScore: number;
  rcScore: number;
  accuracy: number;
  streak: number; // 연속 학습일
  weeklyMinutes: number;
  solvedTotal: number;
  history: { label: string; score: number }[]; // 점수 추이
  byPart: PartAccuracy[];
}

const STATS: Stats = {
  predictedScore: 785,
  lcScore: 420,
  rcScore: 365,
  accuracy: 72,
  streak: 6,
  weeklyMinutes: 180,
  solvedTotal: 342,
  history: [
    { label: "1주", score: 680 },
    { label: "2주", score: 710 },
    { label: "3주", score: 705 },
    { label: "4주", score: 745 },
    { label: "5주", score: 760 },
    { label: "6주", score: 785 },
  ],
  byPart: [
    { part: "Part 1", accuracy: 88 },
    { part: "Part 2", accuracy: 74 },
    { part: "Part 3", accuracy: 65 },
    { part: "Part 5", accuracy: 80 },
    { part: "Part 6", accuracy: 70 },
    { part: "Part 7", accuracy: 58 },
  ],
};

export function getStats(): Stats {
  return STATS;
}
