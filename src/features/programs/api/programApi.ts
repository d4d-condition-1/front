import { apiFetch } from "@/lib/api";

export interface ProgramItem {
  name: string;
  detail: string;
  sets: number | null;
  reps: number | null;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  kind: "fitness" | "education";
  targetEvent: string | null;
  unitId: string | null;
  unitName: string | null;
  items: ProgramItem[];
  isActive: boolean;
  createdAt: string;
  status: "active" | "done";
  completedAt: string | null;
}

export function fetchMyPrograms(): Promise<Program[]> {
  return apiFetch<Program[]>("/api/me/programs");
}

export function completeProgram(id: string): Promise<{ id: string; status: string }> {
  return apiFetch<{ id: string; status: string }>(`/api/me/programs/${id}/complete`, {
    method: "POST",
  });
}
