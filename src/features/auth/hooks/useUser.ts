"use client";

import { useEffect, useState } from "react";

import { fetchMe } from "../api/authApi";
import type { User } from "../types";

interface UseUserResult {
  user: User | null;
  loading: boolean;
}

/** 현재 로그인 사용자 조회 (미로그인이면 user: null) */
export function useUser(): UseUserResult {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchMe()
      .then((u) => active && setUser(u))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return { user, loading };
}
