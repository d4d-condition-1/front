import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/**
 * 페이지 콘텐츠의 최대 폭과 좌우 여백을 잡는 레이아웃 프리미티브.
 * 헤더/푸터 등 전역 레이아웃 컴포넌트는 components/layout 아래에 둔다.
 */
export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mx-auto w-full max-w-5xl px-4", className)} {...props} />
  );
}
