"use client";

import { useEffect, useState } from "react";

import {
  createLibraryItem,
  deleteLibraryItem,
  fetchLibrary,
  updateLibraryItem,
  type LibraryItem,
  type LibraryItemInput,
} from "../api/libraryApi";

interface UseLibraryResult {
  items: LibraryItem[];
  loading: boolean;
  error: Error | null;
  create: (input: LibraryItemInput) => Promise<void>;
  toggle: (item: LibraryItem) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useLibrary(): UseLibraryResult {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    fetchLibrary()
      .then((data) => active && setItems(data))
      .catch((err) => active && setError(err as Error))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  async function create(input: LibraryItemInput) {
    const created = await createLibraryItem(input);
    setItems((prev) => [created, ...prev]);
  }

  async function toggle(item: LibraryItem) {
    const updated = await updateLibraryItem(item.id, {
      isActive: !item.isActive,
    });
    setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)));
  }

  async function remove(id: string) {
    await deleteLibraryItem(id);
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  return { items, loading, error, create, toggle, remove };
}
