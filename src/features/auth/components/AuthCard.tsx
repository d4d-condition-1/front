"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { logout } from "../api/authApi";
import { useAuthForm } from "../hooks/useAuthForm";
import { useUser } from "../hooks/useUser";

const inputCls =
  "w-full rounded-xl border border-white/20 bg-white/10 px-3.5 py-3 text-sm text-white placeholder:text-primary-200 outline-none backdrop-blur focus:border-white/50 focus:ring-2 focus:ring-white/20";

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
  const [unitCode, setUnitCode] = useState("");

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
        // 부대 코드: 장병은 필수, 관리자는 입력 시 해당 부대 담당
        ...(unitCode.trim() ? { unitCode: unitCode.trim() } : {}),
        // 관리자 가입일 때만 코드 전송 (서버가 ADMIN_INVITE_CODE 와 대조)
        ...(signupRole === "admin" ? { adminCode: adminCode.trim() } : {}),
      });
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-white/10 p-8 text-center text-sm text-primary-100 backdrop-blur">
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
        <p className="text-center text-sm text-primary-100">
          <b className="text-white">{user.name}</b>
          {user.rank && ` ${user.rank}`} 님으로 로그인되어 있습니다.
        </p>
        <Link
          href={dest}
          className="rounded-xl bg-white py-3 text-center font-bold text-primary-700 transition-transform hover:scale-[1.01]"
        >
          {destLabel}로 이동
        </Link>
        <button
          onClick={() => logout().then(() => window.location.reload())}
          className="text-xs text-primary-200 underline-offset-2 hover:underline"
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
                ? "bg-white text-primary-700"
                : "text-primary-100 hover:text-white",
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
                      ? "bg-white text-primary-700"
                      : "text-primary-100 hover:text-white",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {signupRole === "trainee" ? (
              <>
                <input
                  value={unitCode}
                  onChange={(e) => setUnitCode(e.target.value.toUpperCase())}
                  placeholder="부대 코드 (예: K7QM-2FWD)"
                  autoComplete="off"
                  required
                  className={inputCls}
                />
                <p className="text-[11px] leading-relaxed text-primary-200">
                  소속 부대 관리자에게 전달받은 부대 코드를 입력하세요. 코드로
                  소속 부대가 자동 등록됩니다.
                </p>
              </>
            ) : (
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
                <input
                  value={unitCode}
                  onChange={(e) => setUnitCode(e.target.value.toUpperCase())}
                  placeholder="담당 부대 코드 (선택 — 없으면 전체 관리)"
                  autoComplete="off"
                  className={inputCls}
                />
                <p className="text-[11px] leading-relaxed text-primary-200">
                  부대에서 발급한 관리자 가입 코드가 필요합니다. 담당 부대
                  코드를 입력하면 해당 부대만 관리하고, 비워두면 전체를
                  관리합니다.
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
          loading={form.submitting}
          className="mt-1 w-full"
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
