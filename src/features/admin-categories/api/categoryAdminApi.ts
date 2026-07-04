import { apiFetch } from "@/lib/api";
import type { Category } from "@/features/categories";

export interface AdminCategory extends Category {
  questionCount: number;
}

export interface CreateCategoryInput {
  code: string;
  name: string;
  description?: string;
  color: string;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
  color?: string;
}

export function adminFetchCategories(): Promise<{ categories: AdminCategory[] }> {
  return apiFetch("/api/admin/categories");
}

export function createCategory(input: CreateCategoryInput): Promise<AdminCategory> {
  return apiFetch("/api/admin/categories", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateCategory(code: string, input: UpdateCategoryInput): Promise<AdminCategory> {
  return apiFetch(`/api/admin/categories/${encodeURIComponent(code)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteCategory(code: string): Promise<void> {
  return apiFetch(`/api/admin/categories/${encodeURIComponent(code)}`, {
    method: "DELETE",
  });
}
