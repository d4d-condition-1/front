"use client";

import { type FormEvent, useEffect, useState } from "react";
import Link from "next/link";

import { Button, Icon, Spinner } from "@/components/ui";
import { fetchMe, login, logout, type User } from "@/features/auth";
import {
  createUnit,
  fetchUnits,
  regenerateUnitCode,
  type Unit,
} from "@/features/admin-units";

type Phase = "checking" | "login" | "forbidden" | "ready";

const inputCls =
  "w-full rounded-xl border border-line bg-surface-2 px-3.5 py-3 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-primary-500";

function isSuperAdmin(u: User): boolean {
  return u.role === "admin" && u.unitId == null;
}

/** 부대코드 발급 비공개 페이지 — 슈퍼관리자 인증 후 부대 생성·코드 재발급. */
export function CodesManager() {
  const [phase, setPhase] = useState<Phase>("checking");
  const [units, setUnits] = useState<Unit[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 인증 폼
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [authing, setAuthing] = useState(false);

  // 부대 발급 폼
  const [unitName, setUnitName] = useState("");
  const [creating, setCreating] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function enter() {
    const list = await fetchUnits();
    setUnits(list);
    setPhase("ready");
  }

  function classify(u: User | null) {
    if (!u) return setPhase("login");
    if (isSuperAdmin(u)) return void enter().catch(() => setPhase("login"));
    setPhase("forbidden");
  }

  useEffect(() => {
    fetchMe().then(classify).catch(() => setPhase("login"));
  }, []);

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setAuthing(true);
    setError(null);
    try {
      const res = await login(loginId.trim(), password);
      classify(res.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "인증에 실패했습니다.");
    } finally {
      setAuthing(false);
    }
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    if (!unitName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const unit = await createUnit(unitName.trim());
      setUnits((prev) => [unit, ...prev]);
      setUnitName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "부대 생성에 실패했습니다.");
    } finally {
      setCreating(false);
    }
  }

  async function onRegenerate(id: string) {
    setPendingId(id);
    setError(null);
    try {
      const updated = await regenerateUnitCode(id);
      setUnits((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "재발급에 실패했습니다.");
    } finally {
      setPendingId(null);
    }
  }

  async function copyCode(u: Unit) {
    try {
      await navigator.clipboard.writeText(u.joinCode);
      setCopiedId(u.id);
      setTimeout(() => setCopiedId((c) => (c === u.id ? null : c)), 1500);
    } catch {
      // 클립보드 미지원 환경은 무시 (사용자가 직접 복사)
    }
  }

  return (
    <main className="tactical-grid relative min-h-screen bg-bg px-5 py-8 text-ink">
      <div className="mx-auto w-full max-w-md">
        {/* 헤더 */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="tabular text-[10px] uppercase tracking-[0.35em] text-signal-400">
              Restricted
            </p>
            <h1 className="mt-1 text-xl font-bold">부대코드 발급</h1>
          </div>
          <Link href="/" className="text-ink-faint hover:text-ink">
            <Icon name="x" size={22} />
          </Link>
        </div>

        {error && (
          <p className="mb-4 rounded-xl bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300">
            {error}
          </p>
        )}

        {phase === "checking" && (
          <div className="grid place-items-center py-24 text-primary-500">
            <Spinner size={28} />
          </div>
        )}

        {phase === "login" && (
          <form
            onSubmit={onLogin}
            className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5"
          >
            <p className="text-sm text-ink-muted">
              부대코드는 <b className="text-ink">전체 관리자</b>만 발급할 수 있습니다. 관리자 계정으로
              인증하세요.
            </p>
            <input
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="관리자 아이디"
              autoComplete="username"
              required
              className={inputCls}
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              type="password"
              autoComplete="current-password"
              required
              className={inputCls}
            />
            <Button type="submit" variant="signal" loading={authing} className="mt-1 w-full">
              인증
            </Button>
          </form>
        )}

        {phase === "forbidden" && (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-line bg-surface p-8 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-red-500/10 text-red-400">
              <Icon name="x" size={24} />
            </div>
            <p className="text-sm text-ink-muted">
              전체 관리자만 부대코드를 발급할 수 있습니다.
              <br />
              부대 소속 관리자·장병 계정은 권한이 없습니다.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => logout().then(() => setPhase("login"))}
            >
              다른 계정으로 인증
            </Button>
          </div>
        )}

        {phase === "ready" && (
          <div className="flex flex-col gap-5">
            {/* 발급 폼 */}
            <form
              onSubmit={onCreate}
              className="flex gap-2 rounded-2xl border border-line bg-surface p-4"
            >
              <input
                value={unitName}
                onChange={(e) => setUnitName(e.target.value)}
                placeholder="새 부대 이름 (예: 1대대 2중대)"
                className={inputCls}
              />
              <Button type="submit" variant="signal" loading={creating} disabled={!unitName.trim()}>
                발급
              </Button>
            </form>

            {/* 부대 코드 목록 */}
            {units.length === 0 ? (
              <p className="py-10 text-center text-sm text-ink-faint">
                아직 발급된 부대가 없습니다.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {units.map((u) => (
                  <li key={u.id} className="rounded-2xl border border-line bg-surface p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="font-semibold text-ink">{u.name}</p>
                      <p className="text-xs text-ink-faint">
                        장병 {u.members} · 관리자 {u.admins}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => copyCode(u)}
                        title="코드 복사"
                        className="tabular flex-1 rounded-xl border border-line-strong bg-surface-2 px-4 py-3 text-left text-lg font-bold tracking-widest text-signal-300 hover:bg-line"
                      >
                        {u.joinCode}
                        {copiedId === u.id && (
                          <span className="ml-2 text-xs font-medium text-primary-400">복사됨</span>
                        )}
                      </button>
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={pendingId === u.id}
                        onClick={() => onRegenerate(u.id)}
                      >
                        재발급
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <p className="text-center text-xs text-ink-faint">
              재발급 시 기존 코드는 즉시 무효화됩니다. 장병은 가입 시 이 코드를 입력합니다.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
