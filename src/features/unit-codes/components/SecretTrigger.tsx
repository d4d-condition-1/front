"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * 숨겨진 진입점 — 화면 구석(우하단)을 빠르게 5번 누르면 부대코드 발급 페이지로 이동.
 * 눈에 보이지 않는 탭 타깃이라 일반 사용자는 알아채지 못한다.
 * (페이지 자체는 서버가 슈퍼관리자 인증을 강제하므로 URL 을 알아도 무단 발급은 불가)
 */
export function SecretTrigger() {
  const router = useRouter();
  const count = useRef(0);
  const last = useRef(0);

  function onTap() {
    const now = Date.now();
    if (now - last.current > 1500) count.current = 0; // 1.5초 넘게 끊기면 리셋
    last.current = now;
    count.current += 1;
    if (count.current >= 5) {
      count.current = 0;
      router.push("/codes");
    }
  }

  return (
    <button
      type="button"
      aria-hidden
      tabIndex={-1}
      onClick={onTap}
      className="fixed bottom-0 right-0 z-50 h-14 w-14 cursor-default opacity-0"
    />
  );
}
