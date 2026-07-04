import { apiFetch } from "@/lib/api";

// 서버 DB와 동기화되는 카테고리. 앱 부트 시 hydrateCategories()로 덮어쓴다.
export type CategoryCode = string;
export type Grade = "S" | "A" | "B" | "C" | "D";

export interface Category {
  code: CategoryCode;
  name: string;
  description: string;
  color: string; // hex
}

export interface CategoryScore {
  code: CategoryCode;
  score: number; // 0~100
  attempts: number;
  correct: number;
}

// 기본값 — 서버 응답 전까지 폴백으로 사용
const DEFAULT_CATEGORIES: Category[] = [
  { code: "TAC", name: "전술기동", description: "소대/분대 전술, 이동대형, 매복/수색", color: "#4f46e5" },
  { code: "FIR", name: "화력운용", description: "사격 절차, 화력 지원 요청, 교전 규칙", color: "#e11d48" },
  { code: "TER", name: "지형판독", description: "독도법, 좌표 체계, 지형 분석", color: "#0891b2" },
  { code: "COM", name: "통신절차", description: "무전 절차, 보고 양식, 통신 보안", color: "#7c3aed" },
  { code: "MED", name: "전장응급처치", description: "TCCC, 후송 절차", color: "#059669" },
  { code: "NBC", name: "화생방", description: "탐지/경보, 개인보호, 제독 절차", color: "#d97706" },
  { code: "EQP", name: "장비운용", description: "K2 소총, K201, 클레모어, 정비", color: "#475569" },
];

// 클라이언트 전용 모듈 캐시 — 서버 fetch 후 교체
export let CATEGORIES: Category[] = [...DEFAULT_CATEGORIES];

/** 서버에서 받아온 카테고리로 모듈 캐시를 업데이트한다. */
export function hydrateCategories(cats: Category[]): void {
  if (cats.length > 0) CATEGORIES = cats;
}

/** 서버 API로부터 카테고리 목록을 가져와 캐시를 동기화한다. */
export function fetchCategories(): Promise<Category[]> {
  return apiFetch<{ categories: Category[] }>("/api/categories").then((r) => {
    hydrateCategories(r.categories);
    return r.categories;
  });
}

export function getCategory(code: CategoryCode): Category {
  return (
    CATEGORIES.find((c) => c.code === code) ?? {
      code,
      name: code,
      description: "",
      color: "#475569",
    }
  );
}

/** 점수 → 등급 */
export function gradeOf(score: number): Grade {
  if (score >= 90) return "S";
  if (score >= 75) return "A";
  if (score >= 60) return "B";
  if (score >= 40) return "C";
  return "D";
}

/** 점수 → 출제 난이도 레벨(1~5) */
export function levelForScore(score: number): number {
  if (score <= 30) return 1;
  if (score <= 50) return 2;
  if (score <= 70) return 3;
  if (score <= 85) return 4;
  return 5;
}

/** 종합 숙련도 = 카테고리 점수 평균 */
export function overallScore(scores: CategoryScore[]): number {
  if (!scores.length) return 0;
  return Math.round(scores.reduce((s, c) => s + c.score, 0) / scores.length);
}

/** 가장 약한 카테고리 */
export function weakestCategory(scores: CategoryScore[]): CategoryScore {
  return [...scores].sort((a, b) => a.score - b.score)[0];
}
