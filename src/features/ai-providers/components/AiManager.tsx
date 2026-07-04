"use client";

import { type FormEvent, type ReactNode, useState } from "react";

import { Badge, Button, Card, Icon } from "@/components/ui";

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15";
import {
  getAiConnections,
  PROVIDER_META,
  type AiConnection,
  type Provider,
} from "../api/aiProviderApi";

/** 관리자 AI 연동 관리: 등록 목록 + 신규 등록 폼 (mock, 로컬 상태). */
export function AiManager() {
  const [connections, setConnections] = useState<AiConnection[]>(getAiConnections);
  const [provider, setProvider] = useState<Provider>("anthropic");
  const [label, setLabel] = useState("");
  const [model, setModel] = useState(PROVIDER_META.anthropic.models[0]);
  const [apiKey, setApiKey] = useState("");
  const [tested, setTested] = useState(false);

  function onProviderChange(p: Provider) {
    setProvider(p);
    setModel(PROVIDER_META[p].models[0]);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!label.trim() || !apiKey.trim()) return;
    const masked = `${apiKey.slice(0, 3)}••••••${apiKey.slice(-4)}`;
    setConnections((prev) => [
      {
        id: `ai${Date.now()}`,
        provider,
        label: label.trim(),
        model,
        apiKeyMasked: masked,
        status: "active",
        requests: 0,
        createdAt: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);
    setLabel("");
    setApiKey("");
  }

  function toggle(id: string) {
    setConnections((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === "active" ? "disabled" : "active" }
          : c,
      ),
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* 등록 목록 */}
      <div className="flex flex-col gap-3">
        {connections.map((c) => (
          <Card key={c.id} className="flex items-center gap-4">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-600">
              <Icon name="cpu" size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-800">{c.label}</p>
                <Badge tone={c.status === "active" ? "green" : "slate"}>
                  {c.status === "active" ? "활성" : "중지"}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-slate-400">
                {PROVIDER_META[c.provider].name} · {c.model} · {c.apiKeyMasked}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                요청 {c.requests.toLocaleString()}회 · 등록 {c.createdAt}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => toggle(c.id)}>
              {c.status === "active" ? "중지" : "재개"}
            </Button>
          </Card>
        ))}
      </div>

      {/* 신규 등록 폼 */}
      <Card className="h-fit">
        <p className="mb-4 font-bold text-slate-900">AI API 등록</p>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <Field label="제공자">
            <select
              value={provider}
              onChange={(e) => onProviderChange(e.target.value as Provider)}
              className={inputCls}
            >
              {Object.entries(PROVIDER_META).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="용도(라벨)">
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="예: 문제 해설 생성"
              className={inputCls}
            />
          </Field>

          <Field label="모델">
            <select value={model} onChange={(e) => setModel(e.target.value)} className={inputCls}>
              {PROVIDER_META[provider].models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </Field>

          <Field label="API Key">
            <input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              type="password"
              className={inputCls}
            />
          </Field>

          <div className="mt-1 flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setTested(true)}
            >
              연결 테스트
            </Button>
            {tested && (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <Icon name="check" size={16} /> 연결 성공
              </span>
            )}
          </div>

          <Button type="submit" className="w-full">
            <Icon name="plus" size={18} /> 등록하기
          </Button>
        </form>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      {children}
    </label>
  );
}
