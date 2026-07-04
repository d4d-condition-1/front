"use client";

import { useEffect, useState } from "react";

import {
  createAiConnection,
  deleteAiConnection,
  fetchAiConnections,
  updateAiConnection,
  type AiConnection,
  type AiConnectionInput,
} from "../api/aiProviderApi";

interface UseAiConnectionsResult {
  connections: AiConnection[];
  loading: boolean;
  error: Error | null;
  create: (input: AiConnectionInput) => Promise<void>;
  toggle: (conn: AiConnection) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useAiConnections(): UseAiConnectionsResult {
  const [connections, setConnections] = useState<AiConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    fetchAiConnections()
      .then((data) => active && setConnections(data))
      .catch((err) => active && setError(err as Error))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  async function create(input: AiConnectionInput) {
    const created = await createAiConnection(input);
    setConnections((prev) => [created, ...prev]);
  }

  async function toggle(conn: AiConnection) {
    const updated = await updateAiConnection(conn.id, {
      status: conn.status === "active" ? "disabled" : "active",
    });
    setConnections((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c)),
    );
  }

  async function remove(id: string) {
    await deleteAiConnection(id);
    setConnections((prev) => prev.filter((c) => c.id !== id));
  }

  return { connections, loading, error, create, toggle, remove };
}
