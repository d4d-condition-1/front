import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantStyles: Record<Variant, string> = {
  primary: "bg-black text-white hover:bg-black/80 dark:bg-white dark:text-black",
  secondary: "border border-black/15 hover:bg-black/5 dark:border-white/20",
  ghost: "hover:bg-black/5 dark:hover:bg-white/10",
};

/**
 * 전역 재사용 UI 프리미티브 예시.
 * 여러 기능에서 공통으로 쓰는 순수 프레젠테이션 컴포넌트는 여기(components/ui)에 둔다.
 */
export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}
