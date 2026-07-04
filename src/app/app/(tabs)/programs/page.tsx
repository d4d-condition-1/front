import { ProgramsView } from "@/features/programs";

export default function ProgramsPage() {
  return (
    <>
      <header className="px-5 pt-6">
        <p className="text-sm text-ink-faint">부대 커리큘럼</p>
        <h1 className="text-xl font-bold text-ink">교육 · 운동</h1>
      </header>
      <ProgramsView />
    </>
  );
}
