import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "signal";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** true 면 스피너 표시 + 클릭 비활성화 (제출 대기 등) */
  loading?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary: "bg-primary-600 text-white hover:bg-primary-500",
  // signal = 전술 앰버. 작전 개시 등 핵심 CTA 에만 (화면당 1개 권장)
  signal: "bg-signal-300 text-[#1a1206] hover:bg-signal-200 font-bold tracking-wide",
  secondary: "bg-surface-2 text-ink ring-1 ring-line hover:bg-line",
  ghost: "text-ink-muted hover:bg-surface-2 hover:text-ink",
  danger: "text-red-400 hover:bg-red-500/10",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-9 px-3 text-sm rounded-lg",
  md: "h-11 px-5 text-sm rounded-xl",
  lg: "h-13 px-6 text-base rounded-2xl w-full py-3.5",
};

/** 전역 재사용 버튼. cn 은 클래스 충돌을 병합하지 않으므로
 *  색 계열(bg-/text-)은 className 으로 덮지 말고 variant 를 추가할 것. */
export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {loading && <Spinner size={size === "sm" ? 14 : 16} />}
      {children}
    </button>
  );
}
