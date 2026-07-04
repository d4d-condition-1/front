// 장병 목록 (관리자용, 서버 /api/admin/users)
import { apiFetch } from "@/lib/api";
import type { Grade } from "@/features/categories";

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

export function fetchTrainees(): Promise<Trainee[]> {
  return apiFetch<Trainee[]>("/api/admin/users");
}
