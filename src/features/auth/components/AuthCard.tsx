"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { logout } from "../api/authApi";
import { useAuthForm } from "../hooks/useAuthForm";
import { useUser } from "../hooks/useUser";

const inputCls =
  "w-full rounded-xl border border-white/20 bg-white/10 px-3.5 py-3 text-sm text-white placeholder:text-indigo-200 outline-none backdrop-blur focus:border-white/50 focus:ring-2 focus:ring-white/20";

type Mode = "login" | "register";
type SignupRole = "trainee" | "admin";

/** 랜딩 로그인/회원가입 카드 (성공 시 역할별로 /admin 또는 /app 이동) */
export function AuthCard() {
  const { user, loading } = useUser();
  const form = useAuthForm();
  const [mode, setMode] = useState<Mode>("login");

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [rank, setRank] = useState("");
  const [unit, setUnit] = useState("");
  const [signupRole, setSignupRole] = useState<SignupRole>("trainee");
  const [adminCode, setAdminCode] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (mode === "login") {
      form.login(loginId.trim(), password);
    } else {
      form.register({
        loginId: loginId.trim(),
        password,
        name: name.trim(),
        rank: rank.trim(),
        unit: unit.trim(),
        role: signupRole,
        // 관리자 가입일 때만 코드 전송 (서버가 ADMIN_INVITE_CODE 와 대조)
        ...(signupRole === "admin" ? { adminCode: adminCode.trim() } : {}),
      });
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-white/10 p-8 text-center text-sm text-indigo-100 backdrop-blur">
        확인 중...
      </div>
    );
  }

  // 이미 로그인된 경우: 바로가기 + 로그아웃
  if (user) {
    const dest = user.role === "admin" ? "/admin" : "/app";
    const destLabel = user.role === "admin" ? "관리자 콘솔" : "훈련 앱";
    return (
      <div className="flex flex-col gap-3 rounded-2xl bg-white/10 p-6 backdrop-blur">
        <p className="text-center text-sm text-indigo-100">
          <b className="text-white">{user.name}</b>
          {user.rank && ` ${user.rank}`} 님으로 로그인되어 있습니다.
        </p>
        <Link
          href={dest}
          className="rounded-xl bg-white py-3 text-center font-bold text-indigo-700 transition-transform hover:scale-[1.01]"
        >
          {destLabel}로 이동
        </Link>
        <button
          onClick={() => logout().then(() => window.location.reload())}
          className="text-xs text-indigo-200 underline-offset-2 hover:underline"
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/10 p-6 backdrop-blur">
      {/* 탭 */}
      <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-black/15 p-1">
        {(["login", "register"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              "rounded-lg py-2 text-sm font-semibold transition-colors",
              mode === m
                ? "bg-white text-indigo-700"
                : "text-indigo-100 hover:text-white",
            )}
          >
            {m === "login" ? "로그인" : "회원가입"}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          placeholder="아이디"
          autoComplete="username"
          required
          className={inputCls}
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === "register" ? "비밀번호 (8자 이상)" : "비밀번호"}
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={mode === "register" ? 8 : undefined}
          className={inputCls}
        />

        {mode === "register" && (
          <>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름"
              required
              className={inputCls}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                placeholder="계급 (예: 일병)"
                className={inputCls}
              />
              <input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="소속 (예: 1소대)"
                className={inputCls}
              />
            </div>

            {/* 가입 유형 선택 */}
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-black/15 p-1">
              {(
                [
                  ["trainee", "일반 장병"],
                  ["admin", "관리자"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSignupRole(value)}
                  className={cn(
                    "rounded-lg py-2 text-xs font-semibold transition-colors",
                    signupRole === value
                      ? "bg-white text-indigo-700"
                      : "text-indigo-100 hover:text-white",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {signupRole === "admin" && (
              <>
                <input
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  placeholder="관리자 가입 코드"
                  type="password"
                  autoComplete="off"
                  required
                  className={inputCls}
                />
                <p className="text-[11px] leading-relaxed text-indigo-200">
                  부대에서 발급한 관리자 가입 코드가 필요합니다. 코드가 없다면
                  일반 장병으로 가입 후 기존 관리자에게 권한 부여를 요청하세요.
                </p>
              </>
            )}
          </>
        )}

        {form.error && (
          <p className="rounded-lg bg-red-500/20 px-3 py-2 text-xs font-medium text-red-100">
            {form.error}
          </p>
        )}

        <Button
          type="submit"
          disabled={form.submitting}
          className="mt-1 w-full bg-white text-indigo-700 hover:bg-indigo-50"
        >
          {form.submitting
            ? "처리 중..."
            : mode === "login"
              ? "로그인"
              : "가입하고 시작하기"}
        </Button>
      </form>
    </div>
  );
}
