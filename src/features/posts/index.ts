// 이 기능의 공개 API(barrel). 외부(app/ 등)에서는 이 파일로만 import 한다.
//   import { PostList } from "@/features/posts";
// 내부 파일 경로를 직접 참조하지 않게 하여 리팩터링에 강하게 만든다.

export { PostList } from "./components/PostList";
export { usePosts } from "./hooks/usePosts";
export { fetchPosts, fetchPost } from "./api/postApi";
export type { Post } from "./types";
