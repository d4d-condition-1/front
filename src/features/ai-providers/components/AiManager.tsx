"use client";

import { type FormEvent, type ReactNode, useState } from "react";

import { Badge, Button, Card, Icon } from "@/components/ui";
import { AdminStatus } from "@/features/admin-dashboard";
import { PROVIDER_META, type Provider } from "../api/aiProviderApi";
import { useAiConnections } from "../hooks/useAiConnections";

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15";

/** 관리자 AI 연동 관리: 등록 목록 + 신규 등록 폼. */
export function AiManager() {
  const { connections, loading, error, create, toggle, remove } =
    useAiConnections();

  const [provider, setProvider] = useState<Provider>("anthropic");
  const [label, setLabel] = useState("");
  const [model, setModel] = useState(PROVIDER_META.anthropic.models[0]);
  const [apiKey, setApiKey] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function onProviderChange(p: Provider) {
    setProvider(p);
    setModel(PROVIDER_META[p].models[0]);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!label.trim() || !apiKey.trim()) return;
    setSubmitting(true);
    setFormError(null);
    try {
      await create({ provider, label: label.trim(), model, apiKey: apiKey.trim() });
      setLabel("");
      setApiKey("");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <AdminStatus message="AI 연동 목록을 불러오는 중..." />;
  if (error) return <AdminStatus message={error.message} isError />;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* 등록 목록 */}
      <div className="flex flex-col gap-3">
        {connections.length === 0 && (
          <Card className="py-10 text-center text-sm text-slate-400">
            등록된 AI 연동이 없습니다. 우측 폼에서 등록하세요.
          </Card>
        )}
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
            <Button variant="ghost" size="sm" onClick={() => toggle(c)}>
              {c.status === "active" ? "중지" : "재개"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:bg-red-50"
              onClick={() => {
                if (confirm(`'${c.label}' 연동을 삭제할까요?`)) remove(c.id);
              }}
            >
              삭제
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

          {formError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
              {formError}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            <Icon name="plus" size={18} />
            {submitting ? "등록 중..." : "등록하기"}
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
