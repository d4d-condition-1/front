"use client";

import { type FormEvent, useState } from "react";

import { AdminHeader } from "@/components/layout";
import { Badge, Button, Card, Icon } from "@/components/ui";
import { AdminStatus } from "@/features/admin-dashboard";
import { useUser } from "@/features/auth";
import { useUnits } from "../hooks/useUnits";

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15";

/** 부대 관리 화면: 부대 목록 + 가입 코드 배포/재발급 + 생성(전체 관리자). */
export function UnitsView() {
  const { user } = useUser();
  const { units, loading, error, create, regenerateCode, remove } = useUnits();
  const isSuper = user?.role === "admin" && user.unitId == null;

  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setFormError(null);
    try {
      await create(name.trim());
      setName("");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "생성에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  function copyCode(id: string, code: string) {
    navigator.clipboard?.writeText(code).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  }

  return (
    <>
      <AdminHeader
        title="부대 관리"
        description="부대 코드를 장병들에게 전파하면, 가입 시 자동으로 해당 부대에 소속됩니다"
      />
      <div className="p-6 md:p-8">
        {loading ? (
          <AdminStatus message="부대 목록을 불러오는 중..." />
        ) : error ? (
          <AdminStatus message={error.message} isError />
        ) : (
          <div
            className={
              isSuper ? "grid gap-6 lg:grid-cols-[1fr_360px]" : "flex flex-col gap-3"
            }
          >
            {/* 부대 목록 */}
            <div className="flex flex-col gap-3">
              {units.length === 0 && (
                <Card className="py-10 text-center text-sm text-slate-400">
                  등록된 부대가 없습니다. 우측 폼에서 부대를 생성하세요.
                </Card>
              )}
              {units.map((u) => (
                <Card key={u.id} className="flex flex-wrap items-center gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-600">
                    <Icon name="home" size={22} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-800">{u.name}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      장병 {u.members}명 · 관리자 {u.admins}명 · 생성 {u.createdAt}
                    </p>
                  </div>

                  {/* 가입 코드 + 복사 */}
                  <button
                    type="button"
                    onClick={() => copyCode(u.id, u.joinCode)}
                    title="클릭하면 복사됩니다"
                    className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 font-mono text-sm font-bold tracking-wider text-slate-700 transition-colors hover:bg-primary-50 hover:text-primary-700"
                  >
                    {u.joinCode}
                    {copiedId === u.id ? (
                      <Badge tone="green">복사됨</Badge>
                    ) : (
                      <Icon name="plus" size={14} className="rotate-45 opacity-40" />
                    )}
                  </button>

                  {isSuper && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (
                            confirm(
                              `'${u.name}' 의 가입 코드를 재발급할까요?\n기존 코드는 즉시 사용할 수 없게 됩니다.`,
                            )
                          )
                            regenerateCode(u.id);
                        }}
                      >
                        코드 재발급
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:bg-red-50"
                        onClick={() => {
                          if (confirm(`'${u.name}' 부대를 삭제할까요?`))
                            remove(u.id).catch((err) =>
                              alert(err instanceof Error ? err.message : "삭제 실패"),
                            );
                        }}
                      >
                        삭제
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* 부대 생성 (전체 관리자 전용) */}
            {isSuper && (
              <Card className="h-fit">
                <p className="mb-1 font-bold text-slate-900">부대 생성</p>
                <p className="mb-4 text-xs text-slate-400">
                  생성하면 가입 코드가 자동 발급됩니다.
                </p>
                <form onSubmit={onCreate} className="flex flex-col gap-3">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="부대 이름 (예: 제1보병대대)"
                    className={inputCls}
                  />
                  {formError && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                      {formError}
                    </p>
                  )}
                  <Button type="submit" className="w-full" disabled={submitting}>
                    <Icon name="plus" size={18} />
                    {submitting ? "생성 중..." : "부대 생성"}
                  </Button>
                </form>
              </Card>
            )}
          </div>
        )}
      </div>
    </>
  );
}
