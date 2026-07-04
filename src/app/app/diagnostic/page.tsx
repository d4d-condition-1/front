import { SessionRunner } from "@/features/training";

export default function DiagnosticPage() {
  return (
    <SessionRunner
      title="진단 테스트"
      mode="diagnostic"
      exitHref="/app"
      ctaHref="/app"
      ctaLabel="내 역량 프로필 보기"
    />
  );
}
