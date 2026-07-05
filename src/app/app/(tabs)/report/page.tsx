"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Spinner } from "@/components/ui";
import { gradeOf } from "@/features/categories";
import {
  useReport,
  fetchReportDetail,
  type ReportDetail,
} from "@/features/report";

const GRADE_COLOR: Record<string, string> = {
  "특급": "#a6c06f",
  "1급": "#a6c06f",
  "2급": "#cba556",
  "3급": "#cba556",
  "미달": "#d18a62",
};

function gc(score: number) {
  return GRADE_COLOR[gradeOf(score)] ?? "#5d6353";
}

export default function ReportPage() {
  const { data: reportData, loading: reportLoading } = useReport();
  const [detail, setDetail] = useState<ReportDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [tab, setTab] = useState<"wrong" | "all">("wrong");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  useEffect(() => {
    let active = true;
    fetchReportDetail()
      .then((d) => active && setDetail(d))
      .catch(() => {})
      .finally(() => active && setDetailLoading(false));
    return () => { active = false; };
  }, []);

  if (reportLoading || detailLoading) {
    return (
      <div className="grid flex-1 place-items-center py-24">
        <Spinner size={28} />
      </div>
    );
  }

  const scores = reportData?.scores ?? [];
  const history = detail?.history ?? [];
  const weakCategories = detail?.categories ?? [];
  const wrongOnly = history.filter((h) => !h.correct);
  const displayed = tab === "wrong" ? wrongOnly : history;

  // 최약점
  const weakest = [...scores].sort((a, b) => a.score - b.score)[0] ?? null;

  function toggle(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div style={{ padding: "18px 20px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 카테고리별 점수 분포 — 항상 표시 */}
      <div
        style={{
          background: "#171c18",
          border: "1px solid #252a20",
          borderRadius: 18,
          padding: 16,
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, color: "#e9ebe0", marginBottom: 14 }}>
          영역별 숙련도
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {scores.length > 0 ? (
            scores.map((s) => (
              <div key={s.code} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: s.color || "#6b7280",
                    flexShrink: 0,
                  }}
                />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#e9ebe0" }}>
                  {s.name}
                </span>
                <div style={{ width: 80, position: "relative", height: 6, background: "#1c2119", borderRadius: 3 }}>
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: `${s.score}%`,
                      background: gc(s.score),
                      borderRadius: 3,
                    }}
                  />
                </div>
                <span style={{ width: 28, textAlign: "right", fontSize: 13, fontWeight: 700, color: gc(s.score) }}>
                  {s.score}
                </span>
                <span
                  style={{
                    width: 20,
                    textAlign: "center",
                    fontSize: 12,
                    fontWeight: 800,
                    color: gc(s.score),
                  }}
                >
                  {gradeOf(s.score)}
                </span>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "16px 0", fontSize: 13, color: "#5d6353" }}>
              등록된 카테고리가 없습니다
            </div>
          )}
        </div>
      </div>

      {/* 취약 분야 분석 — 항상 표시 */}
      <div
        style={{
          background: "#171c18",
          border: "1px solid #252a20",
          borderRadius: 18,
          padding: 16,
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, color: "#e9ebe0", marginBottom: 14 }}>
          취약 분야 분석
        </div>
        {weakCategories.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {weakCategories.map((cat) => (
              <div key={cat.code} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: cat.color || "#6b7280",
                    flexShrink: 0,
                  }}
                />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#e9ebe0" }}>
                  {cat.name}
                </span>
                <div style={{ width: 80, position: "relative", height: 6, background: "#1c2119", borderRadius: 3 }}>
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: `${cat.wrongRate}%`,
                      background: cat.wrongRate >= 50 ? "#d18a62" : cat.wrongRate >= 30 ? "#cba556" : "#a6c06f",
                      borderRadius: 3,
                    }}
                  />
                </div>
                <span
                  style={{
                    width: 40,
                    textAlign: "right",
                    fontSize: 12,
                    fontWeight: 700,
                    color: cat.wrongRate >= 50 ? "#d18a62" : cat.wrongRate >= 30 ? "#cba556" : "#a6c06f",
                  }}
                >
                  {cat.wrongRate}%
                </span>
                <span style={{ fontSize: 11, color: "#5d6353", width: 50, textAlign: "right" }}>
                  {cat.wrong}/{cat.total}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "16px 0", fontSize: 13, color: "#5d6353" }}>
            풀이 기록이 쌓이면 취약 분야가 분석됩니다
          </div>
        )}
      </div>

      {/* 약점 훈련 — 항상 표시 */}
      <Link
        href={
          weakest
            ? `/app/training/session?mode=adaptive&category=${weakest.code}&name=${encodeURIComponent(weakest.name)}`
            : "/app/training/session?mode=adaptive"
        }
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "#171c18",
          border: "1px solid #252a20",
          borderRadius: 16,
          padding: "14px 16px",
          textDecoration: "none",
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            background: "#cfe6c2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: "#3f5a33",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="8" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "#8a907c" }}>
            {weakest ? `${weakest.name} · 추천 훈련` : "추천 훈련"}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#e9ebe0" }}>
            {weakest
              ? `${weakest.name} 집중 훈련 · Lv.${Math.max(1, Math.ceil(weakest.score / 20))}`
              : "적응형 훈련 시작하기"}
          </div>
        </div>
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#a6c06f",
            whiteSpace: "nowrap",
            display: "inline-flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          약점 훈련{" "}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </span>
      </Link>

      {/* 탭: 오답 / 전체 */}
      <div style={{ display: "flex", background: "#171c18", border: "1px solid #252a20", borderRadius: 9, padding: 2, alignSelf: "flex-start" }}>
        <button
          onClick={() => setTab("wrong")}
          style={{
            fontSize: 11,
            fontWeight: tab === "wrong" ? 700 : 600,
            color: tab === "wrong" ? "#0e1210" : "#8a907c",
            background: tab === "wrong" ? "#d18a62" : "transparent",
            padding: "4px 12px",
            borderRadius: 7,
            border: "none",
            cursor: "pointer",
          }}
        >
          오답 ({wrongOnly.length})
        </button>
        <button
          onClick={() => setTab("all")}
          style={{
            fontSize: 11,
            fontWeight: tab === "all" ? 700 : 600,
            color: tab === "all" ? "#0e1210" : "#8a907c",
            background: tab === "all" ? "#a6c06f" : "transparent",
            padding: "4px 12px",
            borderRadius: 7,
            border: "none",
            cursor: "pointer",
          }}
        >
          전체 ({history.length})
        </button>
      </div>

      {/* 문항 목록 */}
      {displayed.length === 0 ? (
        <div
          style={{
            background: "#171c18",
            border: "1px solid #252a20",
            borderRadius: 14,
            padding: "32px 20px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 13, color: "#5d6353" }}>
            {tab === "wrong"
              ? history.length > 0
                ? "오답이 없습니다. 잘하고 있어요!"
                : "풀이 기록이 없습니다. 훈련을 시작해보세요."
              : "풀이 기록이 없습니다. 훈련을 시작해보세요."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {displayed.map((item) => {
            const isOpen = expanded.has(item.id);
            return (
              <div
                key={item.id}
                style={{
                  background: "#171c18",
                  border: `1px solid ${item.correct ? "#252a20" : "#2f261f"}`,
                  borderRadius: 14,
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => toggle(item.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 14px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: item.correct ? "#a6c06f" : "#d18a62",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#e9ebe0",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: isOpen ? "normal" : "nowrap",
                      }}
                    >
                      {item.question}
                    </div>
                    <div style={{ fontSize: 11, color: "#5d6353", marginTop: 2 }}>
                      {item.categoryName} · 난이도 {item.difficulty}
                    </div>
                  </div>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#5d6353"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      flexShrink: 0,
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {isOpen && (
                  <div style={{ padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {item.options.map((opt, i) => {
                        const isAnswer = i === item.answerIndex;
                        const isSelected = i === item.selectedIndex;
                        let bg = "transparent";
                        let border = "1px solid #252a20";
                        let textColor = "#8a907c";
                        if (isAnswer) {
                          bg = "rgba(166,192,111,0.12)";
                          border = "1px solid #a6c06f";
                          textColor = "#a6c06f";
                        } else if (isSelected && !item.correct) {
                          bg = "rgba(209,138,98,0.12)";
                          border = "1px solid #d18a62";
                          textColor = "#d18a62";
                        }
                        return (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 8,
                              padding: "8px 10px",
                              borderRadius: 10,
                              background: bg,
                              border,
                              fontSize: 13,
                              color: textColor,
                              lineHeight: 1.5,
                            }}
                          >
                            <span style={{ fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                            <span style={{ flex: 1 }}>
                              {opt}
                              {isAnswer && <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700 }}>← 정답</span>}
                              {isSelected && !item.correct && !isAnswer && <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700 }}>← 내 선택</span>}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {item.explanation && (
                      <div style={{ background: "#141811", borderRadius: 10, padding: "10px 12px" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#a6c06f", marginBottom: 4 }}>해설</div>
                        <div style={{ fontSize: 13, color: "#8a907c", lineHeight: 1.6 }}>{item.explanation}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
