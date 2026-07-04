"use client";

import { useCallback, useEffect, useState } from "react";

import { completeProgram, fetchMyPrograms, type Program } from "../api/programApi";

interface UseMyProgramsResult {
  programs: Program[];
  loading: boolean;
  error: string | null;
  pendingId: string | null;
  complete: (id: string) => Promise<void>;
}

export function useMyPrograms(): UseMyProgramsResult {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchMyPrograms()
      .then((p) => active && setPrograms(p))
      .catch((e) => active && setError(e instanceof Error ? e.message : "불러오기 실패"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const complete = useCallback(async (id: string) => {
    setPendingId(id);
    try {
      await completeProgram(id);
      setPrograms((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "done" } : p)),
      );
    } finally {
      setPendingId(null);
    }
  }, []);

  return { programs, loading, error, pendingId, complete };
}
