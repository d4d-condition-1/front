// 장병 목록 (관리자용, 서버 /api/admin/users)
import { apiFetch } from "@/lib/api";
import type { Grade } from "@/features/categories";

export interface Trainee {
  id: string;
  name: string;
  rank: string; // 계급
  unit: string; // 세부 소속 (소대/분대)
  unitName: string | null; // 소속 부대
  score: number; // 종합 숙련도 0~100
  grade: Grade;
  solved: number;
  lastActive: string;
}

export function fetchTrainees(): Promise<Trainee[]> {
  return apiFetch<Trainee[]>("/api/admin/users");
}
