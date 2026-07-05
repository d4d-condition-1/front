"use client";

import Link from "next/link";

import { Spinner } from "@/components/ui";
import { useUser } from "@/features/auth";
import { gradeOf } from "@/features/categories";
import { useReport } from "@/features/report";

const GRADE_COLOR: Record<string, string> = {
  "특급": "#a6c06f",
  "1급": "#a6c06f",
  "2급": "#cba556",
  "3급": "#cba556",
  "미달": "#d18a62",
};

function gc(score: number) {
  return GRADE_COLOR[gradeOf(score)] ?? "#8a907c";
}

export default function AppHome() {
  const { user } = useUser();
  const { data, loading } = useReport();

  if (loading) {
    return (
      <div className="grid flex-1 place-items-center py-24">
        <Spinner size={28} />
      </div>
    );
  }

  const scores = data?.scores ?? [];
  const stats = data?.stats;
  const rank = data?.rank ?? 0;
  const totalInUnit = data?.totalInUnit ?? 0;

  const overallScore = scores.length
    ? Math.round(scores.reduce((s, c) => s + c.score, 0) / scores.length)
    : 0;
  const overallGrade = gradeOf(overallScore);

  // 약점 순 정렬 (gap ascending)
  const sorted = [...scores].sort(
    (a, b) => (a.score - (a.unitAvg ?? a.score)) - (b.score - (b.unitAvg ?? b.score)),
  );

  // 최약점 = 점수가 가장 낮은 카테고리
  const weakest = [...scores].sort((a, b) => a.score - b.score)[0] ?? null;
  const maxGapItem = sorted[0] ?? null;
  const maxGapDiff = maxGapItem ? maxGapItem.score - (maxGapItem.unitAvg ?? maxGapItem.score) : 0;

  const userName = user?.name ?? "";
  const unitName = user?.unitName ?? "";

  return (
    <div
      style={{
        padding: "18px 20px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {/* 사용자 정보 + 종합 등급 + 순위 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 12, color: "#8a907c" }}>
            {userName}{unitName ? ` · ${unitName}` : ""}
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#e9ebe0", marginTop: 2 }}>
            종합 <span style={{ color: gc(overallScore) }}>{overallGrade}</span> · {overallScore}점
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "#8a907c" }}>부대 내</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "#e9ebe0" }}>
            {totalInUnit > 0 ? rank : "-"}
            <span style={{ fontSize: 12, color: "#8a907c", fontWeight: 600 }}>
              {" "}/ {totalInUnit > 0 ? `${totalInUnit}위` : "-"}
            </span>
          </div>
        </div>
      </div>

      {/* 최대 격차 스포트라이트 */}
      <div
        style={{
          background: "#171c18",
          border: `1px solid ${maxGapDiff < 0 ? "#2f261f" : "#252a20"}`,
          borderRadius: 18,
          padding: 16,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div
            style={{
              fontSize: 10,
              color: maxGapDiff < 0 ? "#d18a62" : "#8a907c",
              fontWeight: 700,
              letterSpacing: 0.5,
            }}
          >
            최대 격차
          </div>
          <div
            style={{
              fontSize: 34,
              fontWeight: 800,
              color: maxGapDiff < 0 ? "#d18a62" : "#8a907c",
              lineHeight: 1.1,
            }}
          >
            {maxGapItem ? maxGapDiff : "-"}
          </div>
        </div>
        <div style={{ width: 1, alignSelf: "stretch", background: "#221f19" }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: "#e9ebe0" }}>
            {maxGapItem ? maxGapItem.name : "데이터 없음"}
          </div>
          {maxGapItem ? (
            <>
              <div style={{ fontSize: 13, color: "#8a907c", marginTop: 3 }}>
                나 <b style={{ color: "#e9ebe0" }}>{maxGapItem.score}</b> · 부대{" "}
                <b style={{ color: "#e9ebe0" }}>{maxGapItem.unitAvg ?? "-"}</b>
              </div>
              <div style={{ fontSize: 12, color: "#8a907c", marginTop: 2 }}>
                {maxGapDiff < 0 ? "우선 보강 대상" : "양호"}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: "#8a907c", marginTop: 3 }}>
              훈련을 시작하면 분석됩니다
            </div>
          )}
        </div>
      </div>

      {/* 나 vs 부대 평균 비교 트랙 — 항상 표시 */}
      <div
        style={{
          background: "#171c18",
          border: "1px solid #252a20",
          borderRadius: 18,
          padding: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 700, color: "#e9ebe0" }}>나 vs 부대 평균</span>
          <span
            style={{
              fontSize: 11,
              color: "#8a907c",
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#a6c06f" }} />
              나
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: "#0e1210",
                  border: "2px solid #8a907c",
                }}
              />
              부대
            </span>
          </span>
        </div>

        {scores.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {sorted.map((s) => {
              const diff = s.score - (s.unitAvg ?? s.score);
              const positive = diff >= 0;
              const color = diff === 0 ? "#8a907c" : positive ? "#a6c06f" : "#d18a62";
              const myLeft = Math.min(95, Math.max(5, s.score));
              const avgLeft = Math.min(95, Math.max(5, s.unitAvg ?? s.score));
              const barL = Math.min(myLeft, avgLeft);
              const barW = Math.abs(myLeft - avgLeft);

              return (
                <div key={s.code}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 7,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#e9ebe0" }}>
                      {s.name}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color }}>
                      {s.unitAvg != null ? `${positive ? "+" : ""}${diff}` : `${s.score}점`}
                    </span>
                  </div>
                  <div style={{ position: "relative", height: 10 }}>
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: 4,
                        height: 2,
                        background: "#1c2119",
                        borderRadius: 2,
                      }}
                    />
                    {barW > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          top: 3,
                          height: 4,
                          left: `${barL}%`,
                          width: `${barW}%`,
                          background: color,
                          borderRadius: 2,
                        }}
                      />
                    )}
                    {s.unitAvg != null && (
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: `${avgLeft}%`,
                          width: 10,
                          height: 10,
                          marginLeft: -5,
                          borderRadius: "50%",
                          background: "#0e1210",
                          border: "2px solid #8a907c",
                        }}
                      />
                    )}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: `${myLeft}%`,
                        width: 10,
                        height: 10,
                        marginLeft: -5,
                        borderRadius: "50%",
                        background: s.score === 0 ? "#5d6353" : color,
                        border: "2px solid #0e1210",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <p style={{ fontSize: 13, color: "#5d6353" }}>등록된 카테고리가 없습니다</p>
          </div>
        )}
      </div>

      {/* 데이터 없음 안내 */}
      {(!stats || stats.totalSolved === 0) && (
        <div
          style={{
            background: "#171c18",
            border: "1px solid #252a20",
            borderRadius: 18,
            padding: "24px 20px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: "#e9ebe0", marginBottom: 6 }}>
            아직 훈련 데이터가 없습니다
          </div>
          <div style={{ fontSize: 13, color: "#8a907c", lineHeight: 1.6 }}>
            관리자에게 훈련 문항 생성을 요청하거나,
            <br />
            등록된 문항이 있다면 아래에서 훈련을 시작하세요.
          </div>
        </div>
      )}

      {/* 약점 훈련 카드 — 항상 표시 */}
      <Link
        href={
          weakest?.name
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
            {weakest?.name ? `${weakest.name} · 추천 훈련` : "추천 훈련"}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#e9ebe0" }}>
            {weakest?.name
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

      {/* 진단 테스트 */}
      <Link
        href="/app/diagnostic"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          background: "transparent",
          border: "1px solid #252a20",
          borderRadius: 16,
          padding: "12px 16px",
          textDecoration: "none",
          fontSize: 13,
          fontWeight: 700,
          color: "#a6c06f",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="6" y1="20" x2="6" y2="12" />
          <line x1="12" y1="20" x2="12" y2="6" />
          <line x1="18" y1="20" x2="18" y2="15" />
        </svg>
        진단 테스트
      </Link>
    </div>
  );
}
