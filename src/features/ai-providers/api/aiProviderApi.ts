// AI 연동 관리 (관리자용, 서버 /api/admin/ai-providers)
import { apiFetch } from "@/lib/api";

export type Provider = "openai" | "anthropic" | "google";

export interface AiConnection {
  id: string;
  provider: Provider;
  label: string;
  model: string;
  apiKeyMasked: string;
  status: "active" | "disabled";
  requests: number;
  createdAt: string;
}

export interface AiConnectionInput {
  provider: Provider;
  label: string;
  model: string;
  apiKey: string;
}

export const PROVIDER_META: Record<
  Provider,
  { name: string; models: string[]; accent: string }
> = {
  openai: { name: "OpenAI", models: ["gpt-4o", "gpt-4o-mini", "o3"], accent: "emerald" },
  anthropic: {
    name: "Anthropic",
    models: ["claude-opus-4-8", "claude-sonnet-5", "claude-haiku-4-5"],
    accent: "amber",
  },
  google: { name: "Google", models: ["gemini-2.5-pro", "gemini-2.5-flash"], accent: "indigo" },
};

export function fetchAiConnections(): Promise<AiConnection[]> {
  return apiFetch<AiConnection[]>("/api/admin/ai-providers");
}

export function createAiConnection(
  input: AiConnectionInput,
): Promise<AiConnection> {
  return apiFetch<AiConnection>("/api/admin/ai-providers", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateAiConnection(
  id: string,
  patch: Partial<Pick<AiConnection, "label" | "model" | "status">> & {
    apiKey?: string;
  },
): Promise<AiConnection> {
  return apiFetch<AiConnection>(`/api/admin/ai-providers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export function deleteAiConnection(id: string): Promise<void> {
  return apiFetch<void>(`/api/admin/ai-providers/${id}`, { method: "DELETE" });
}
