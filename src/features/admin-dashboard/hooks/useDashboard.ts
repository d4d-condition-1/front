"use client";

import { useEffect, useState } from "react";

import { fetchDashboard, type DashboardStats } from "../api/dashboardApi";

interface UseDashboardResult {
  data: DashboardStats | null;
  loading: boolean;
  error: Error | null;
}

export function useDashboard(): UseDashboardResult {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    fetchDashboard()
      .then((d) => active && setData(d))
      .catch((err) => active && setError(err as Error))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return { data, loading, error };
}
