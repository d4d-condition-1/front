"use client";

import { useState } from "react";

import { Badge, Button, Card, Icon, Spinner } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useFitness } from "../hooks/useFitness";
import type { FitnessEventCode, FitnessGrade } from "../api/fitnessApi";

const gradeTone: Record<string, "primary" | "green" | "amber" | "red" | "slate"> = {
  특급: "primary",
  "1급": "green",
  "2급": "green",
  "3급": "amber",
  무급: "slate",
};

/** cuts 배열을 "특급 72 / 1급 64 / 2급 56 / 3급 48" 형태로 */
function cutsLabel(cuts: number[], unit: string): string {
  const tiers = ["특급", "1급", "2급", "3급"];
  const suffix = unit.includes("초") ? "초" : "";
  return cuts.map((c, i) => `${tiers[i]} ${c}${suffix}`).join(" · ");
}

export function FitnessView() {
  const { summary, loading, error, submitting, log } = useFitness();
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [activeEvent, setActiveEvent] = useState<FitnessEventCode | null>(null);

  async function onLog(code: FitnessEventCode) {
    const raw = inputs[code];
    const value = Number(raw);
    if (!Number.isInteger(value) || value <= 0) return;
    setActiveEvent(code);
    try {
      await log(code, value);
      setInputs((p) => ({ ...p, [code]: "" }));
    } catch {
      // error 는 훅에서 표시
    } finally {
      setActiveEvent(null);
    }
  }

  if (loading) {
    return (
      <div className="grid flex-1 place-items-center py-20 text-primary-600">
        <Spinner size={28} />
      </div>
    );
  }

  const overall = summary?.overall ?? null;

  return (
    <div className="flex flex-col gap-5 px-5 pb-6 pt-5">
      {/* 종합 특급전사 판정 */}
      <div
        className={cn(
          "flex items-center gap-4 rounded-2xl p-5 text-white shadow-sm",
          overall === "특급"
            ? "bg-gradient-to-br from-amber-500 to-amber-600"
            : "bg-gradient-to-br from-primary-600 to-primary-800",
        )}
      >
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/15 backdrop-blur">
          <Icon name={overall === "특급" ? "trophy" : "dumbbell"} size={32} />
        </div>
        <div className="flex-1">
          <p className="text-xs text-white/80">특급전사 체력 검정</p>
          <p className="text-2xl font-black">
            {overall ? `종합 ${overall}` : "미검정"}
          </p>
          <p className="mt-0.5 text-xs text-white/80">
            {overall === "특급"
              ? "3종목 모두 특급 — 특급전사 인증! 🏅"
              : overall
                ? "가장 낮은 종목 등급이 종합 등급이 됩니다"
                : "세 종목을 모두 측정하면 종합 등급이 산출됩니다"}
          </p>
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      {/* 종목별 기록 입력 */}
      {summary?.events.map((ev) => (
        <Card key={ev.code} className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900">{ev.name}</p>
              <p className="text-xs text-slate-400">{cutsLabel(ev.cuts, ev.unit)}</p>
            </div>
            {ev.latest ? (
              <Badge tone={gradeTone[ev.latest.grade as FitnessGrade]}>
                {ev.latest.grade}
              </Badge>
            ) : (
              <Badge tone="slate">미측정</Badge>
            )}
          </div>

          {ev.latest && (
            <p className="text-sm text-slate-500">
              최근 기록{" "}
              <b className="text-slate-800">
                {ev.latest.value}
                {ev.unit.includes("초") ? "초" : "회"}
              </b>
            </p>
          )}

          <div className="flex gap-2">
            <input
              type="number"
              inputMode="numeric"
              value={inputs[ev.code] ?? ""}
              onChange={(e) => setInputs((p) => ({ ...p, [ev.code]: e.target.value }))}
              placeholder={`측정값 (${ev.unit})`}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
            <Button
              size="sm"
              loading={submitting && activeEvent === ev.code}
              disabled={!inputs[ev.code]}
              onClick={() => onLog(ev.code)}
            >
              기록
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
