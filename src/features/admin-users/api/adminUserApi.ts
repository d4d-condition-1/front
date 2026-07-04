// 프론트 전용 mock 장병 데이터 (관리자용).
import { gradeOf, type Grade } from "@/features/categories";

export interface Trainee {
  id: string;
  name: string;
  rank: string; // 계급
  unit: string; // 소속
  score: number; // 종합 숙련도 0~100
  grade: Grade;
  solved: number;
  lastActive: string;
}

const RAW: Omit<Trainee, "grade">[] = [
  { id: "u1", name: "김일병", rank: "일병", unit: "1소대 3분대", score: 62, solved: 216, lastActive: "5분 전" },
  { id: "u2", name: "이상병", rank: "상병", unit: "1소대 2분대", score: 78, solved: 402, lastActive: "1시간 전" },
  { id: "u3", name: "박병장", rank: "병장", unit: "2소대 1분대", score: 91, solved: 588, lastActive: "어제" },
  { id: "u4", name: "최이병", rank: "이병", unit: "2소대 3분대", score: 38, solved: 41, lastActive: "3일 전" },
  { id: "u5", name: "정하사", rank: "하사", unit: "화기소대", score: 84, solved: 470, lastActive: "2시간 전" },
  { id: "u6", name: "강일병", rank: "일병", unit: "3소대 1분대", score: 47, solved: 96, lastActive: "1일 전" },
];

export function getTrainees(): Trainee[] {
  return RAW.map((t) => ({ ...t, grade: gradeOf(t.score) }));
}
