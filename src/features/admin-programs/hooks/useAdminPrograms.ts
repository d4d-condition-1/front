"use client";

import { useCallback, useEffect, useState } from "react";

import {
  adminFetchPrograms,
  createProgram,
  deleteProgram,
  type CreateProgramInput,
  type Program,
} from "../api/adminProgramApi";

export function useAdminPrograms() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    adminFetchPrograms()
      .then((p) => active && setPrograms(p))
      .catch((e) => active && setError(e instanceof Error ? e.message : "불러오기 실패"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const create = useCallback(async (input: CreateProgramInput) => {
    const created = await createProgram(input);
    setPrograms((prev) => [created, ...prev]);
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteProgram(id);
    setPrograms((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { programs, loading, error, create, remove };
}
