"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { login, register } from "../api/authApi";
import type { RegisterInput, User } from "../types";

/** 로그인 성공 시 역할별 이동 경로 */
function destinationFor(user: User): string {
  return user.role === "admin" ? "/admin" : "/app";
}

/** 로그인/회원가입 폼 로직 (제출 · 로딩 · 에러 · 성공 시 라우팅) */
export function useAuthForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<{ user: User }>) {
    setSubmitting(true);
    setError(null);
    try {
      const { user } = await action();
      router.replace(destinationFor(user));
    } catch (err) {
      setError(err instanceof Error ? err.message : "요청에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return {
    submitting,
    error,
    login: (loginId: string, password: string) =>
      run(() => login(loginId, password)),
    register: (input: RegisterInput) => run(() => register(input)),
  };
}
