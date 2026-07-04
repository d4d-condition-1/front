import { notFound } from "next/navigation";

import { getMaterial, getQuestions } from "@/features/materials";
import { QuizRunner } from "@/features/quiz";

export default async function SolvePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const material = getMaterial(id);
  if (!material) notFound();

  const questions = getQuestions(id);

  return <QuizRunner title={material.title} questions={questions} />;
}
