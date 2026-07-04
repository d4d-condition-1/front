"use client";

// 프레젠테이션 계층: usePosts 훅의 결과를 화면에 그리기만 한다.
// 데이터 로딩 로직은 훅에, 재사용 프리미티브는 components/ui 에 위임한다.

import { usePosts } from "../hooks/usePosts";

export function PostList() {
  const { posts, loading, error } = usePosts();

  if (loading) return <p className="text-sm text-zinc-500">불러오는 중…</p>;
  if (error) return <p className="text-sm text-red-500">에러가 발생했습니다.</p>;

  return (
    <ul className="flex flex-col gap-2">
      {posts.map((post) => (
        <li key={post.id} className="text-sm">
          {post.title}
        </li>
      ))}
    </ul>
  );
}
