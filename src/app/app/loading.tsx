import { Spinner } from "@/components/ui";

/** /app 세그먼트 로딩 UI (로그인 직후 첫 진입·페이지 전환 시 표시) */
export default function AppLoading() {
  return (
    <div className="mx-auto grid min-h-screen w-full max-w-md flex-1 place-items-center bg-slate-50">
      <div className="flex flex-col items-center gap-3 text-primary-600">
        <Spinner size={28} />
        <p className="text-sm font-medium text-slate-400">불러오는 중...</p>
      </div>
    </div>
  );
}
