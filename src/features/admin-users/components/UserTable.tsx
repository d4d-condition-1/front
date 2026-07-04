import { Badge } from "@/components/ui";
import type { Grade } from "@/features/categories";
import type { Trainee } from "../api/adminUserApi";

const gradeTone: Record<Grade, "green" | "primary" | "amber" | "red"> = {
  S: "primary",
  A: "green",
  B: "green",
  C: "amber",
  D: "red",
};

/** 장병 목록 테이블. */
export function UserTable({ trainees }: { trainees: Trainee[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-surface ring-1 ring-line">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs text-ink-faint">
            <th className="px-5 py-3 font-medium">장병</th>
            <th className="px-5 py-3 font-medium">소속</th>
            <th className="px-5 py-3 font-medium">종합 숙련도</th>
            <th className="px-5 py-3 font-medium">등급</th>
            <th className="px-5 py-3 font-medium">푼 문제</th>
            <th className="px-5 py-3 font-medium">최근 활동</th>
          </tr>
        </thead>
        <tbody>
          {trainees.map((t) => (
            <tr key={t.id} className="border-b border-line last:border-0 hover:bg-surface-2/60">
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                    {t.name.slice(0, 1)}
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{t.name}</p>
                    <p className="text-xs text-ink-faint">{t.rank}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3 text-ink-muted">
                {t.unitName ? (
                  <>
                    {t.unitName}
                    {t.unit && (
                      <span className="text-ink-faint"> · {t.unit}</span>
                    )}
                  </>
                ) : (
                  t.unit || "-"
                )}
              </td>
              <td className="px-5 py-3 font-medium text-ink">{t.score}</td>
              <td className="px-5 py-3">
                <Badge tone={gradeTone[t.grade]}>{t.grade}</Badge>
              </td>
              <td className="px-5 py-3 text-ink-muted">{t.solved}</td>
              <td className="px-5 py-3 text-ink-faint">{t.lastActive}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
