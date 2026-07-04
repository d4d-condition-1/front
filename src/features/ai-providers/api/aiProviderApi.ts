// 프론트 전용 mock: 등록된 AI 연동 목록 + 제공자 메타.
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

const CONNECTIONS: AiConnection[] = [
  {
    id: "ai1",
    provider: "anthropic",
    label: "문제 해설 생성",
    model: "claude-opus-4-8",
    apiKeyMasked: "sk-ant-••••••4f2a",
    status: "active",
    requests: 12840,
    createdAt: "2026-05-02",
  },
  {
    id: "ai2",
    provider: "openai",
    label: "약점 분석 리포트",
    model: "gpt-4o",
    apiKeyMasked: "sk-••••••9c11",
    status: "active",
    requests: 6320,
    createdAt: "2026-05-20",
  },
  {
    id: "ai3",
    provider: "google",
    label: "예상 점수 추정(실험)",
    model: "gemini-2.5-flash",
    apiKeyMasked: "AIza••••••7b0",
    status: "disabled",
    requests: 410,
    createdAt: "2026-06-10",
  },
];

export function getAiConnections(): AiConnection[] {
  return CONNECTIONS;
}
