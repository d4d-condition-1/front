"use client";

import { useEffect, useState } from "react";

import { fetchTrainees, type Trainee } from "../api/adminUserApi";

interface UseTraineesResult {
  trainees: Trainee[];
  loading: boolean;
  error: Error | null;
}

export function useTrainees(): UseTraineesResult {
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    fetchTrainees()
      .then((data) => active && setTrainees(data))
      .catch((err) => active && setError(err as Error))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return { trainees, loading, error };
}
