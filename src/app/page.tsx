import { AuthCard } from "@/features/auth";
import { SecretTrigger } from "@/features/unit-codes";

export default function LandingPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-primary-950 via-[#242c17] to-primary-900 px-6 text-white">
      {/* 숨겨진 진입점: 우하단 구석 5번 탭 → 부대코드 발급 */}
      <SecretTrigger />
      {/* 전술 지도풍 그리드 배경 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      {/* 상단 시그널 라인 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary-400 to-transparent"
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mb-4 inline-grid h-16 w-16 place-items-center rounded-2xl border border-primary-400/40 bg-primary-800/60 text-2xl font-black tracking-tight backdrop-blur">
            D4D
          </span>
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-primary-300">
            Combat Readiness Accelerator
          </p>
          <h1 className="mt-2 text-2xl font-bold">전투 숙달 가속 시뮬레이터</h1>
          <p className="mt-2 text-sm text-primary-100/90">
            AI가 장병의 약점을 진단하고 맞춤형 전술 훈련을 제공합니다.
          </p>
        </div>

        <AuthCard />
      </div>
    </main>
  );
}
