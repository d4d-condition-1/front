"use client";

import { useEffect, useState } from "react";

import { fetchReport, type ReportData } from "../api/reportApi";

export function useReport() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchReport()
      .then((d) => active && setData(d))
      .catch((e) => active && setError(e instanceof Error ? e.message : "리포트를 불러올 수 없습니다."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return { data, loading, error };
}
