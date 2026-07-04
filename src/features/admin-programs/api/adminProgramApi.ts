import { apiFetch } from "@/lib/api";
import type { Program, ProgramItem } from "@/features/programs";

export type { Program, ProgramItem };

export interface CreateProgramInput {
  title: string;
  description?: string;
  kind: "fitness" | "education";
  targetEvent?: string | null;
  unitId?: string | null;
  items: ProgramItem[];
}

export function adminFetchPrograms(): Promise<Program[]> {
  return apiFetch<Program[]>("/api/admin/programs");
}

export function createProgram(input: CreateProgramInput): Promise<Program> {
  return apiFetch<Program>("/api/admin/programs", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteProgram(id: string): Promise<void> {
  return apiFetch<void>(`/api/admin/programs/${id}`, { method: "DELETE" });
}
