import { SessionRunner } from "@/features/training";

export default function TrainingPage() {
  return (
    <SessionRunner
      title="적응형 훈련"
      mode="adaptive"
      exitHref="/app"
      ctaHref="/app/report"
      ctaLabel="리포트 보기"
    />
  );
}
