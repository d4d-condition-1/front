"use client";

import { useState } from "react";

import { AdminHeader } from "@/components/layout";
import { Badge, Button, Card, Icon } from "@/components/ui";
import { AdminStatus } from "@/features/admin-dashboard";
import { useAdminPrograms } from "../hooks/useAdminPrograms";
import type { ProgramItem } from "../api/adminProgramApi";

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100";

const FIT_EVENTS = [
  { code: "pushup", name: "팔굽혀펴기" },
  { code: "situp", name: "윗몸일으키기" },
  { code: "run3km", name: "3km 달리기" },
];

const emptyItem = (): ProgramItem => ({ name: "", detail: "", sets: null, reps: null });

/** 관리자 프로그램(커리큘럼) 작성·관리 화면. 배정 시 대상 장병에게 실시간 알림이 발송된다. */
export function ProgramsManager() {
  const { programs, loading, error, create, remove } = useAdminPrograms();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState<"fitness" | "education">("fitness");
  const [targetEvent, setTargetEvent] = useState("");
  const [items, setItems] = useState<ProgramItem[]>([emptyItem()]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function setItem(i: number, patch: Partial<ProgramItem>) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }

  async function onSubmit() {
    setFormError(null);
    const cleanItems = items
      .map((it) => ({ ...it, name: it.name.trim() }))
      .filter((it) => it.name);
    if (!title.trim()) return setFormError("제목을 입력하세요.");

    setSubmitting(true);
    try {
      await create({
        title: title.trim(),
        description: description.trim(),
        kind,
        targetEvent: kind === "fitness" && targetEvent ? targetEvent : null,
        items: cleanItems,
      });
      setTitle("");
      setDescription("");
      setTargetEvent("");
      setItems([emptyItem()]);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "생성 실패");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <AdminHeader
        title="커리큘럼 관리"
        description="운동·교육 프로그램을 만들어 부대에 배정합니다 (배정 시 장병에게 실시간 알림)"
      />
      <div className="grid gap-6 p-6 md:grid-cols-[1fr_1.2fr] md:p-8">
        {/* 작성 폼 */}
        <Card className="flex flex-col gap-3">
          <p className="font-bold text-slate-900">새 프로그램</p>

          <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
            {(["fitness", "education"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
                  kind === k ? "bg-white text-primary-700 shadow-sm" : "text-slate-500"
                }`}
              >
                {k === "fitness" ? "운동" : "교육"}
              </button>
            ))}
          </div>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="프로그램 제목"
            className={inputCls}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="설명 (선택)"
            rows={2}
            className={inputCls}
          />

          {kind === "fitness" && (
            <select
              value={targetEvent}
              onChange={(e) => setTargetEvent(e.target.value)}
              className={inputCls}
            >
              <option value="">추천 매칭 종목 (선택 안 함)</option>
              {FIT_EVENTS.map((ev) => (
                <option key={ev.code} value={ev.code}>
                  {ev.name} 약점자에게 추천
                </option>
              ))}
            </select>
          )}

          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-slate-500">세부 항목</p>
            {items.map((it, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={it.name}
                  onChange={(e) => setItem(i, { name: e.target.value })}
                  placeholder="항목명 (예: 팔굽혀펴기)"
                  className={inputCls}
                />
                <input
                  type="number"
                  value={it.sets ?? ""}
                  onChange={(e) => setItem(i, { sets: e.target.value ? Number(e.target.value) : null })}
                  placeholder="세트"
                  className="w-20 rounded-xl border border-slate-200 px-2 py-2.5 text-sm outline-none focus:border-primary-400"
                />
                <input
                  type="number"
                  value={it.reps ?? ""}
                  onChange={(e) => setItem(i, { reps: e.target.value ? Number(e.target.value) : null })}
                  placeholder="횟수"
                  className="w-20 rounded-xl border border-slate-200 px-2 py-2.5 text-sm outline-none focus:border-primary-400"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => setItems((p) => [...p, emptyItem()])}
              className="flex items-center gap-1 self-start text-xs font-semibold text-primary-600"
            >
              <Icon name="plus" size={14} /> 항목 추가
            </button>
          </div>

          {formError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
              {formError}
            </p>
          )}
          <Button loading={submitting} onClick={onSubmit}>
            프로그램 배정
          </Button>
        </Card>

        {/* 목록 */}
        <div className="flex flex-col gap-3">
          {loading ? (
            <AdminStatus message="불러오는 중..." />
          ) : error ? (
            <AdminStatus message={error} isError />
          ) : programs.length === 0 ? (
            <AdminStatus message="아직 프로그램이 없습니다." />
          ) : (
            programs.map((p) => (
              <Card key={p.id} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <Badge tone={p.kind === "fitness" ? "green" : "primary"}>
                      {p.kind === "fitness" ? "운동" : "교육"}
                    </Badge>
                    <Badge tone="slate">{p.unitName ?? "전체"}</Badge>
                  </div>
                  <p className="font-bold text-slate-900">{p.title}</p>
                  {p.description && (
                    <p className="mt-0.5 text-sm text-slate-500">{p.description}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-400">{p.items.length}개 항목</p>
                </div>
                <Button variant="danger" size="sm" onClick={() => remove(p.id)}>
                  삭제
                </Button>
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  );
}
