// 계정/권한 관리 (관리자용, 서버 /api/admin/accounts, /api/admin/users/:id/role)
import { apiFetch } from "@/lib/api";
import type { Role } from "@/features/auth";

export interface Account {
  id: string;
  loginId: string;
  name: string;
  rank: string;
  unit: string;
  role: Role;
  createdAt: string; // YYYY-MM-DD
  lastActive: string; // "5분 전" 형태
  isSelf: boolean; // 요청한 관리자 본인 여부
}

export function fetchAccounts(): Promise<Account[]> {
  return apiFetch<Account[]>("/api/admin/accounts");
}

/** 역할 변경 (본인/마지막 관리자는 서버가 거부한다) */
export function updateAccountRole(
  id: string,
  role: Role,
): Promise<{ id: string; role: Role }> {
  return apiFetch<{ id: string; role: Role }>(`/api/admin/users/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

/** 비밀번호 초기화 (슈퍼 관리자 전용) */
export function resetPassword(
  id: string,
  password: string,
): Promise<{ id: string; loginId: string; name: string }> {
  return apiFetch(`/api/admin/users/${id}/reset-password`, {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}
