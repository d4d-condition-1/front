import { cn } from "@/lib/utils";

/** 인라인 로딩 스피너. 텍스트 색을 상속하므로 어디서든 색 지정 없이 쓴다. */
export function Spinner({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <span
      role="status"
      aria-label="로딩 중"
      className={cn(
        "inline-block shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent",
        className,
      )}
      style={{ width: size, height: size }}
    />
  );
}
