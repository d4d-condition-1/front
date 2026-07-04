"use client";

import { useEffect, useState } from "react";

import { fetchCategoryAnalytics, type CategoryAnalytics } from "../api/categoryAnalyticsApi";

export function useCategoryAnalytics() {
  const [data, setData] = useState<CategoryAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    fetchCategoryAnalytics()
      .then((d) => active && setData(d))
      .catch((err) => active && setError(err as Error))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  return { data, loading, error };
}
