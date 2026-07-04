"use client";

import { useCallback, useEffect, useState } from "react";

import {
  fetchMyFitness,
  logFitnessRecord,
  type FitnessEventCode,
  type FitnessSummary,
} from "../api/fitnessApi";

interface UseFitnessResult {
  summary: FitnessSummary | null;
  loading: boolean;
  error: string | null;
  submitting: boolean;
  log: (event: FitnessEventCode, value: number) => Promise<void>;
}

export function useFitness(): UseFitnessResult {
  const [summary, setSummary] = useState<FitnessSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    fetchMyFitness()
      .then((s) => active && setSummary(s))
      .catch((e) => active && setError(e instanceof Error ? e.message : "불러오기 실패"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const log = useCallback(async (event: FitnessEventCode, value: number) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await logFitnessRecord(event, value);
      setSummary(res.summary);
    } catch (e) {
      setError(e instanceof Error ? e.message : "기록 저장 실패");
      throw e;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { summary, loading, error, submitting, log };
}
