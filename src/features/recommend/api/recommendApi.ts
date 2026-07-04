import { apiFetch } from "@/lib/api";

export interface RecommendCard {
  type: "assignment" | "knowledge" | "fitness";
  title: string;
  reason: string;
  cta: string;
  link: string;
  priority: number;
}

export function fetchRecommendations(): Promise<{ cards: RecommendCard[] }> {
  return apiFetch<{ cards: RecommendCard[] }>("/api/me/recommendations");
}
