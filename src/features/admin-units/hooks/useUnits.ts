"use client";

import { useEffect, useState } from "react";

import {
  createUnit,
  deleteUnit,
  fetchUnits,
  regenerateUnitCode,
  type Unit,
} from "../api/unitApi";

interface UseUnitsResult {
  units: Unit[];
  loading: boolean;
  error: Error | null;
  create: (name: string) => Promise<void>;
  regenerateCode: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useUnits(): UseUnitsResult {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    fetchUnits()
      .then((data) => active && setUnits(data))
      .catch((err) => active && setError(err as Error))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  async function create(name: string) {
    const created = await createUnit(name);
    setUnits((prev) => [...prev, created]);
  }

  async function regenerateCode(id: string) {
    const updated = await regenerateUnitCode(id);
    setUnits((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  }

  async function remove(id: string) {
    await deleteUnit(id);
    setUnits((prev) => prev.filter((u) => u.id !== id));
  }

  return { units, loading, error, create, regenerateCode, remove };
}
