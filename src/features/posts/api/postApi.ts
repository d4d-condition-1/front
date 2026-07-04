// 데이터 계층: 전역 apiFetch를 감싸 이 기능의 요청 함수를 정의한다.
// 컴포넌트/훅은 fetch를 직접 호출하지 않고 이 함수들만 사용한다.

import { apiFetch } from "@/lib/api";

import type { Post } from "../types";

export function fetchPosts(): Promise<Post[]> {
  return apiFetch<Post[]>("/posts");
}

export function fetchPost(id: number): Promise<Post> {
  return apiFetch<Post>(`/posts/${id}`);
}
