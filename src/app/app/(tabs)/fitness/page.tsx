import { FitnessView } from "@/features/fitness";

export default function FitnessPage() {
  return (
    <>
      <header className="px-5 pt-6">
        <p className="text-sm text-slate-400">체력 검정</p>
        <h1 className="text-xl font-bold text-slate-900">특급전사 도전</h1>
      </header>
      <FitnessView />
    </>
  );
}
