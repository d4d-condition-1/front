// 관리자 대시보드 — 부대 전체 현황 (서버 /api/admin/dashboard)
import { apiFetch } from "@/lib/api";

export interface DashboardStats {
  totalTrainees: number;
  avgProficiency: number;
  trainedToday: number;
  aiRequests: number;
  gradeDist: { grade: string; count: number }[];
  recentActivity: { user: string; action: string; time: string }[];
}

export function fetchDashboard(): Promise<DashboardStats> {
  return apiFetch<DashboardStats>("/api/admin/dashboard");
}
