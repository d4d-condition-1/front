import { getAdaptiveQuestions, SessionRunner } from "@/features/training";

export default function TrainingPage() {
  const questions = getAdaptiveQuestions();

  return (
    <SessionRunner
      title="적응형 훈련"
      questions={questions}
      exitHref="/app"
      ctaHref="/app/report"
      ctaLabel="리포트 보기"
    />
  );
}
