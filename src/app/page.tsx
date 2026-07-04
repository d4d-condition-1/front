import { AuthCard } from "@/features/auth";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-indigo-600 to-indigo-800 px-6 text-white">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mb-4 inline-grid h-16 w-16 place-items-center rounded-2xl bg-white/15 text-2xl font-black backdrop-blur">
            D4D
          </span>
          <h1 className="text-2xl font-bold">전투 숙달 가속 시뮬레이터</h1>
          <p className="mt-2 text-sm text-indigo-100">
            AI가 장병의 약점을 진단하고 맞춤형 전술 훈련을 제공합니다.
          </p>
        </div>

        <AuthCard />
      </div>
    </main>
  );
}
