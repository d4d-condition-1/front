import { apiFetch } from "@/lib/api";

export type FitnessEventCode = "pushup" | "situp" | "run3km";
export type FitnessGrade = "특급" | "1급" | "2급" | "3급" | "무급";

export interface FitnessEventState {
  code: FitnessEventCode;
  name: string;
  unit: string;
  higherBetter: boolean;
  cuts: number[];
  latest: { value: number; grade: FitnessGrade; recordedAt: string } | null;
}

export interface FitnessSummary {
  events: FitnessEventState[];
  overall: FitnessGrade | null;
}

export interface LogResult {
  event: FitnessEventCode;
  value: number;
  grade: FitnessGrade;
  summary: FitnessSummary;
}

export function fetchMyFitness(): Promise<FitnessSummary> {
  return apiFetch<FitnessSummary>("/api/me/fitness");
}

export function logFitnessRecord(
  event: FitnessEventCode,
  value: number,
): Promise<LogResult> {
  return apiFetch<LogResult>("/api/me/fitness", {
    method: "POST",
    body: JSON.stringify({ event, value }),
  });
}
