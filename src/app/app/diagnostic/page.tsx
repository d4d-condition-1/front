import { getDiagnosticQuestions, SessionRunner } from "@/features/training";

export default function DiagnosticPage() {
  const questions = getDiagnosticQuestions();

  return (
    <SessionRunner
      title="진단 테스트"
      questions={questions}
      exitHref="/app"
      ctaHref="/app"
      ctaLabel="내 역량 프로필 보기"
    />
  );
}
