"use client";

import { useState } from "react";

import { AdminHeader } from "@/components/layout";
import { Badge, Button } from "@/components/ui";
import { AdminStatus } from "@/features/admin-dashboard";
import type { Role } from "@/features/auth";
import type { Account } from "../api/accountApi";
import { useAccounts } from "../hooks/useAccounts";

/** 계정/권한 관리 화면. 관리자 승격·해제를 담당한다. */
export function AccountsView() {
  const { accounts, loading, error, pendingId, changeRole } = useAccounts();
  const [actionError, setActionError] = useState<string | null>(null);

  const adminCount = accounts.filter((a) => a.role === "admin" || a.role === "super_admin").length;

  async function onChangeRole(account: Account, role: Role) {
    const label =
      role === "admin"
        ? `${account.name}(${account.loginId}) 님에게 관리자 권한을 부여할까요?`
        : `${account.name}(${account.loginId}) 님의 관리자 권한을 해제할까요?`;
    if (!window.confirm(label)) return;

    setActionError(null);
    try {
      await changeRole(account.id, role);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "역할 변경에 실패했습니다.");
    }
  }

  return (
    <>
      <AdminHeader
        title="계정/권한 관리"
        description={
          loading
            ? "불러오는 중..."
            : `총 ${accounts.length}개 계정 · 관리자 ${adminCount}명`
        }
      />
      <div className="p-6 md:p-8">
        {actionError && (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {actionError}
          </p>
        )}

        {loading ? (
          <AdminStatus message="계정 목록을 불러오는 중..." />
        ) : error ? (
          <AdminStatus message={error.message} isError />
        ) : (
          <div className="overflow-x-auto rounded-2xl bg-surface ring-1 ring-line">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs text-ink-faint">
                  <th className="px-5 py-3 font-medium">계정</th>
                  <th className="px-5 py-3 font-medium">계급 / 소속</th>
                  <th className="px-5 py-3 font-medium">역할</th>
                  <th className="px-5 py-3 font-medium">가입일</th>
                  <th className="px-5 py-3 font-medium">최근 활동</th>
                  <th className="px-5 py-3 font-medium">권한</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-line last:border-0 hover:bg-surface-2/60"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                          {a.name.slice(0, 1)}
                        </span>
                        <div>
                          <p className="font-semibold text-ink">
                            {a.name}
                            {a.isSelf && (
                              <span className="ml-1.5 text-xs font-medium text-primary-500">
                                (본인)
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-ink-faint">{a.loginId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-ink-muted">
                      {[a.rank, a.unit].filter(Boolean).join(" / ") || "-"}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={a.role === "super_admin" ? "amber" : a.role === "admin" ? "primary" : "slate"}>
                        {a.role === "super_admin" ? "슈퍼 관리자" : a.role === "admin" ? "관리자" : "장병"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-ink-muted">{a.createdAt}</td>
                    <td className="px-5 py-3 text-ink-faint">{a.lastActive}</td>
                    <td className="px-5 py-3">
                      {a.isSelf || a.role === "super_admin" ? (
                        <span className="text-xs text-ink-faint">{a.isSelf ? "변경 불가" : "슈퍼 관리자"}</span>
                      ) : a.role === "admin" ? (
                        <Button
                          size="sm"
                          variant="danger"
                          disabled={pendingId !== null}
                          loading={pendingId === a.id}
                          onClick={() => onChangeRole(a, "trainee")}
                        >
                          {pendingId === a.id ? "변경 중..." : "권한 해제"}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={pendingId !== null}
                          loading={pendingId === a.id}
                          onClick={() => onChangeRole(a, "admin")}
                        >
                          {pendingId === a.id ? "변경 중..." : "관리자 승격"}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
