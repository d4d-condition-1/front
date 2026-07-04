import { apiFetch, clearAuthToken, setAuthToken } from "@/lib/api";
import type { AuthResponse, RegisterInput, User } from "../types";

export async function login(
  loginId: string,
  password: string,
): Promise<AuthResponse> {
  const res = await apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ loginId, password }),
  });
  setAuthToken(res.token);
  return res;
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  const res = await apiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
  setAuthToken(res.token);
  return res;
}

export async function logout(): Promise<void> {
  try {
    await apiFetch<void>("/api/auth/logout", { method: "POST" });
  } finally {
    clearAuthToken();
  }
}

/** 현재 로그인 사용자. 미로그인(401)이면 null */
export async function fetchMe(): Promise<User | null> {
  try {
    const res = await apiFetch<{ user: User }>("/api/auth/me");
    return res.user;
  } catch {
    return null;
  }
}
