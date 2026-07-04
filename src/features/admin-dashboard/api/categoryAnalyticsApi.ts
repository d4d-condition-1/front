import { apiFetch } from "@/lib/api";

export interface CategoryAnalytics {
  code: string;
  name: string;
  color: string;
  trainees: number;
  avgScore: number;
  totalAttempts: number;
  totalCorrect: number;
  accuracy: number;
}

export function fetchCategoryAnalytics(): Promise<CategoryAnalytics[]> {
  return apiFetch<CategoryAnalytics[]>("/api/admin/analytics/categories");
}
