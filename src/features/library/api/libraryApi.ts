// 교범/교리 자료 관리 (관리자용, 서버 /api/admin/materials)
import { apiFetch } from "@/lib/api";
import type { CategoryCode } from "@/features/categories";

export interface LibraryItem {
  id: string;
  title: string;
  category: CategoryCode;
  pages: number;
  isActive: boolean;
  uploadedAt: string;
}

export interface LibraryItemInput {
  title: string;
  category: CategoryCode;
  pages: number;
}

export function fetchLibrary(): Promise<LibraryItem[]> {
  return apiFetch<LibraryItem[]>("/api/admin/materials");
}

export function createLibraryItem(
  input: LibraryItemInput,
): Promise<LibraryItem> {
  return apiFetch<LibraryItem>("/api/admin/materials", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateLibraryItem(
  id: string,
  patch: Partial<LibraryItemInput> & { isActive?: boolean },
): Promise<LibraryItem> {
  return apiFetch<LibraryItem>(`/api/admin/materials/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export function deleteLibraryItem(id: string): Promise<void> {
  return apiFetch<void>(`/api/admin/materials/${id}`, { method: "DELETE" });
}
