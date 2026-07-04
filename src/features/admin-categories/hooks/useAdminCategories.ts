"use client";

import { useCallback, useEffect, useState } from "react";

import { hydrateCategories } from "@/features/categories";
import {
  adminFetchCategories,
  createCategory,
  deleteCategory,
  updateCategory,
  type AdminCategory,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "../api/categoryAdminApi";

export function useAdminCategories() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    adminFetchCategories()
      .then((r) => {
        setCategories(r.categories);
        hydrateCategories(r.categories);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "불러오기 실패"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (input: CreateCategoryInput) => {
    const cat = await createCategory(input);
    setCategories((prev) => [...prev, { ...cat, questionCount: 0 }]);
    hydrateCategories([...categories, cat]);
    return cat;
  }, [categories]);

  const update = useCallback(async (code: string, input: UpdateCategoryInput) => {
    const updated = await updateCategory(code, input);
    setCategories((prev) =>
      prev.map((c) => (c.code === code ? { ...updated, questionCount: c.questionCount } : c)),
    );
    return updated;
  }, []);

  const remove = useCallback(async (code: string) => {
    await deleteCategory(code);
    setCategories((prev) => prev.filter((c) => c.code !== code));
  }, []);

  return { categories, loading, error, create, update, remove };
}
