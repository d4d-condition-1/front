"use client";

import { Badge, Button, Card, Icon, Spinner } from "@/components/ui";
import { useMyPrograms } from "../hooks/useMyPrograms";

/** 장병용 커리큘럼 목록 — 배정된 운동/교육 프로그램을 보고 완료 체크 */
export function ProgramsView() {
  const { programs, loading, error, pendingId, complete } = useMyPrograms();

  if (loading) {
    return (
      <div className="grid flex-1 place-items-center py-20 text-primary-600">
        <Spinner size={28} />
      </div>
    );
  }

  if (error) {
    return <p className="px-5 py-10 text-center text-sm text-red-500">{error}</p>;
  }

  if (programs.length === 0) {
    return (
      <div className="grid flex-1 place-items-center px-5 py-20 text-center">
        <div>
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
            <Icon name="list" size={24} />
          </div>
          <p className="text-sm text-slate-400">배정된 커리큘럼이 아직 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-5 pb-6 pt-5">
      {programs.map((p) => (
        <Card key={p.id} className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2">
                <Badge tone={p.kind === "fitness" ? "green" : "primary"}>
                  {p.kind === "fitness" ? "운동" : "교육"}
                </Badge>
                {p.status === "done" && <Badge tone="slate">완료</Badge>}
              </div>
              <p className="font-bold text-slate-900">{p.title}</p>
              {p.description && (
                <p className="mt-0.5 text-sm text-slate-500">{p.description}</p>
              )}
            </div>
            <Icon
              name={p.kind === "fitness" ? "dumbbell" : "book"}
              size={22}
              className="shrink-0 text-slate-300"
            />
          </div>

          {p.items.length > 0 && (
            <ul className="flex flex-col gap-1.5 rounded-xl bg-slate-50 p-3">
              {p.items.map((it, i) => (
                <li key={i} className="flex items-baseline gap-2 text-sm">
                  <span className="text-primary-500">•</span>
                  <span className="font-medium text-slate-700">{it.name}</span>
                  {(it.sets || it.reps) && (
                    <span className="text-xs text-slate-400">
                      {it.sets ? `${it.sets}세트` : ""}
                      {it.sets && it.reps ? " x " : ""}
                      {it.reps ? `${it.reps}회` : ""}
                    </span>
                  )}
                  {it.detail && <span className="text-xs text-slate-400">— {it.detail}</span>}
                </li>
              ))}
            </ul>
          )}

          {p.status === "done" ? (
            <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
              <Icon name="check" size={16} /> 수행 완료
            </p>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              loading={pendingId === p.id}
              onClick={() => complete(p.id)}
              className="self-start"
            >
              완료 체크
            </Button>
          )}
        </Card>
      ))}
    </div>
  );
}
