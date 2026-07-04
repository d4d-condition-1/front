// 부대 관리 (관리자용, 서버 /api/admin/units)
import { apiFetch } from "@/lib/api";

export interface Unit {
  id: string;
  name: string;
  joinCode: string; // 장병 가입 시 입력하는 부대 코드
  members: number; // 소속 장병 수
  admins: number; // 소속 관리자 수
  createdAt: string;
}

export function fetchUnits(): Promise<Unit[]> {
  return apiFetch<Unit[]>("/api/admin/units");
}

/** 부대 생성 (전체 관리자 전용) — 가입 코드가 자동 발급된다 */
export function createUnit(name: string): Promise<Unit> {
  return apiFetch<Unit>("/api/admin/units", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

/** 가입 코드 재발급 (전체 관리자 전용) — 기존 코드는 즉시 무효 */
export function regenerateUnitCode(id: string): Promise<Unit> {
  return apiFetch<Unit>(`/api/admin/units/${id}/code`, { method: "POST" });
}

/** 부대 삭제 (전체 관리자 전용, 소속 인원이 없을 때만) */
export function deleteUnit(id: string): Promise<void> {
  return apiFetch<void>(`/api/admin/units/${id}`, { method: "DELETE" });
}
