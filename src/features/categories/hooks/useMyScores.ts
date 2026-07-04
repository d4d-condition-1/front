"use client";

import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";
import type { CategoryScore } from "../api/categoryApi";

/**
 * 실제 서버의 내 카테고리별 점수 프로필. (/api/me/scores)
 * 신규 장병은 7개 카테고리가 0점으로 초기화되어 내려온다.
 */
export function useMyScores() {
  const [scores, setScores] = useState<CategoryScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiFetch<CategoryScore[]>("/api/me/scores")
      .then((s) => active && setScores(s))
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return { scores, loading };
}
