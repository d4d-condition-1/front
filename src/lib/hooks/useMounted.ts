"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * 클라이언트에서 마운트가 끝나면 true를 반환한다.
 * 서버/클라이언트 렌더 결과가 달라 하이드레이션 경고가 나는 값을
 * 안전하게 렌더링할 때 사용한다.
 *
 * useEffect + setState 대신 useSyncExternalStore를 써서
 * 서버 스냅샷(false)과 클라이언트 스냅샷(true)을 분리한다.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
