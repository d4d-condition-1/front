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
    label: "전술 문항 생성 엔진",
    model: "claude-sonnet-5",
    apiKeyMasked: "sk-ant-••••••4f2a",
    status: "active",
    requests: 12840,
    createdAt: "2026-05-02",
  },
  {
    id: "ai2",
    provider: "anthropic",
    label: "서술형 답변 채점(Lv.5)",
    model: "claude-opus-4-8",
    apiKeyMasked: "sk-ant-••••••9c11",
    status: "active",
    requests: 6320,
    createdAt: "2026-05-20",
  },
  {
    id: "ai3",
    provider: "openai",
    label: "진단 문항 생성(실험)",
    model: "gpt-4o",
    apiKeyMasked: "sk-••••••7b0",
    status: "disabled",
    requests: 410,
    createdAt: "2026-06-10",
  },
];

export function getAiConnections(): AiConnection[] {
  return CONNECTIONS;
}
