"use client";

import { useCallback, useEffect, useState } from "react";

import type { Role } from "@/features/auth";
import { fetchAccounts, updateAccountRole, type Account } from "../api/accountApi";

interface UseAccountsResult {
  accounts: Account[];
  loading: boolean;
  error: Error | null;
  /** 역할 변경 중인 계정 id (버튼 비활성화용) */
  pendingId: string | null;
  changeRole: (id: string, role: Role) => Promise<void>;
}

export function useAccounts(): UseAccountsResult {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchAccounts()
      .then((data) => active && setAccounts(data))
      .catch((err) => active && setError(err as Error))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const changeRole = useCallback(async (id: string, role: Role) => {
    setPendingId(id);
    try {
      const updated = await updateAccountRole(id, role);
      setAccounts((prev) =>
        prev.map((a) => (a.id === updated.id ? { ...a, role: updated.role } : a)),
      );
    } finally {
      setPendingId(null);
    }
  }, []);

  return { accounts, loading, error, pendingId, changeRole };
}
