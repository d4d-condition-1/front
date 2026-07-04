"use client";

// 로직 계층: 상태/데이터 로딩 등 화면과 분리된 로직을 훅으로 캡슐화한다.
// 컴포넌트는 이 훅이 돌려주는 값만 그려서 UI와 로직을 분리한다.

import { useEffect, useState } from "react";

import { fetchPosts } from "../api/postApi";
import type { Post } from "../types";

interface UsePostsResult {
  posts: Post[];
  loading: boolean;
  error: Error | null;
}

export function usePosts(): UsePostsResult {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    fetchPosts()
      .then((data) => active && setPosts(data))
      .catch((err) => active && setError(err as Error))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return { posts, loading, error };
}
