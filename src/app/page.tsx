import Link from "next/link";

import { Icon } from "@/components/ui";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-indigo-600 to-indigo-800 px-6 text-white">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <span className="mb-4 inline-grid h-16 w-16 place-items-center rounded-2xl bg-white/15 text-2xl font-black backdrop-blur">
            D4D
          </span>
          <h1 className="text-2xl font-bold">전투 숙달 가속 시뮬레이터</h1>
          <p className="mt-2 text-sm text-indigo-100">
            AI가 장병의 약점을 진단하고 맞춤형 전술 훈련을 제공합니다.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/app"
            className="flex items-center gap-4 rounded-2xl bg-white p-5 text-slate-900 shadow-lg transition-transform hover:scale-[1.02]"
          >
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-indigo-100 text-indigo-600">
              <Icon name="play" size={24} />
            </span>
            <span className="flex-1">
              <span className="block font-bold">훈련 시작하기</span>
              <span className="block text-xs text-slate-400">장병 앱 (모바일)</span>
            </span>
            <Icon name="chevronRight" size={20} className="text-slate-300" />
          </Link>

          <Link
            href="/admin"
            className="flex items-center gap-4 rounded-2xl bg-white/10 p-5 backdrop-blur transition-colors hover:bg-white/15"
          >
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/15">
              <Icon name="settings" size={24} />
            </span>
            <span className="flex-1">
              <span className="block font-bold">관리자 콘솔</span>
              <span className="block text-xs text-indigo-100">사용자 · AI · 자료 관리</span>
            </span>
            <Icon name="chevronRight" size={20} className="text-indigo-200" />
          </Link>
        </div>
      </div>
    </main>
  );
}
