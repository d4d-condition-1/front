import { Badge } from "@/components/ui";
import type { AdminUser } from "../api/adminUserApi";

/** 관리자 사용자 목록 테이블. */
export function UserTable({ users }: { users: AdminUser[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-slate-100">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs text-slate-400">
            <th className="px-5 py-3 font-medium">사용자</th>
            <th className="px-5 py-3 font-medium">플랜</th>
            <th className="px-5 py-3 font-medium">상태</th>
            <th className="px-5 py-3 font-medium">목표점수</th>
            <th className="px-5 py-3 font-medium">푼 문제</th>
            <th className="px-5 py-3 font-medium">최근 활동</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                    {u.name.slice(0, 1)}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800">{u.name}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3">
                <Badge tone={u.plan === "프리미엄" ? "indigo" : "slate"}>{u.plan}</Badge>
              </td>
              <td className="px-5 py-3">
                <Badge tone={u.status === "활성" ? "green" : "red"}>{u.status}</Badge>
              </td>
              <td className="px-5 py-3 font-medium text-slate-700">{u.targetScore}</td>
              <td className="px-5 py-3 text-slate-600">{u.solved}</td>
              <td className="px-5 py-3 text-slate-400">{u.lastActive}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
