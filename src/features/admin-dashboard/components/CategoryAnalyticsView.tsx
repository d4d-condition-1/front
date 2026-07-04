"use client";

import { Card } from "@/components/ui";
import { AdminStatus } from "./DashboardView";
import { useCategoryAnalytics } from "../hooks/useCategoryAnalytics";

function scoreLabel(score: number): string {
  if (score >= 90) return "우수";
  if (score >= 70) return "양호";
  if (score >= 50) return "보통";
  if (score >= 30) return "미흡";
  return "취약";
}

function scoreTone(score: number): string {
  if (score >= 90) return "text-emerald-600";
  if (score >= 70) return "text-sky-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
}

export function CategoryAnalyticsView() {
  const { data, loading, error } = useCategoryAnalytics();

  if (loading) return <AdminStatus message="카테고리 분석을 불러오는 중..." />;
  if (error) return <AdminStatus message={error.message} isError />;
  if (data.length === 0) {
    return (
      <Card className="py-10 text-center text-sm text-ink-faint">
        등록된 카테고리가 없습니다.
      </Card>
    );
  }

  const sorted = [...data].sort((a, b) => b.avgScore - a.avgScore);
  const strengths = sorted.filter((d) => d.avgScore >= 70 && d.trainees > 0);
  const weaknesses = sorted.filter((d) => d.avgScore < 50 && d.trainees > 0).reverse();

  return (
    <div className="flex flex-col gap-6">
      {/* 카테고리별 평균 점수 바 차트 */}
      <Card>
        <p className="mb-4 font-bold text-ink">카테고리별 부대 평균</p>
        <div className="flex flex-col gap-3">
          {data.map((cat) => (
            <div key={cat.code} className="flex items-center gap-3">
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: cat.color || "#6b7280" }}
              />
              <span className="w-24 shrink-0 truncate text-sm font-medium text-ink">
                {cat.name}
              </span>
              <div className="h-6 flex-1 overflow-hidden rounded-lg bg-surface-2">
                <div
                  className="h-full rounded-lg transition-all"
                  style={{
                    width: `${(cat.avgScore / 100) * 100}%`,
                    backgroundColor: cat.color || "#6b7280",
                    opacity: 0.7,
                  }}
                />
              </div>
              <span className={`w-12 text-right text-sm font-bold ${scoreTone(cat.avgScore)}`}>
                {cat.avgScore}점
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* 강점 / 약점 요약 */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="mb-3 text-sm font-bold text-emerald-600">강점 분야</p>
          {strengths.length === 0 ? (
            <p className="text-sm text-ink-faint">아직 데이터가 부족합니다.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {strengths.slice(0, 3).map((s) => (
                <li key={s.code} className="flex items-center justify-between text-sm">
                  <span className="text-ink">{s.name}</span>
                  <span className="font-semibold text-emerald-600">{s.avgScore}점 ({scoreLabel(s.avgScore)})</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <p className="mb-3 text-sm font-bold text-red-600">약점 분야</p>
          {weaknesses.length === 0 ? (
            <p className="text-sm text-ink-faint">아직 데이터가 부족합니다.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {weaknesses.slice(0, 3).map((w) => (
                <li key={w.code} className="flex items-center justify-between text-sm">
                  <span className="text-ink">{w.name}</span>
                  <span className="font-semibold text-red-600">{w.avgScore}점 ({scoreLabel(w.avgScore)})</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* 상세 테이블 */}
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-ink-muted">
              <th className="px-4 py-3 font-medium">카테고리</th>
              <th className="px-4 py-3 font-medium text-center">응시 인원</th>
              <th className="px-4 py-3 font-medium text-center">총 풀이</th>
              <th className="px-4 py-3 font-medium text-center">정답률</th>
              <th className="px-4 py-3 font-medium text-center">평균 점수</th>
              <th className="px-4 py-3 font-medium text-center">평가</th>
            </tr>
          </thead>
          <tbody>
            {data.map((cat) => (
              <tr key={cat.code} className="border-b border-line last:border-0">
                <td className="flex items-center gap-2 px-4 py-3 font-medium text-ink">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: cat.color || "#6b7280" }}
                  />
                  {cat.name}
                </td>
                <td className="px-4 py-3 text-center text-ink-muted">{cat.trainees}명</td>
                <td className="px-4 py-3 text-center text-ink-muted">{cat.totalAttempts}회</td>
                <td className="px-4 py-3 text-center text-ink-muted">{cat.accuracy}%</td>
                <td className={`px-4 py-3 text-center font-bold ${scoreTone(cat.avgScore)}`}>
                  {cat.avgScore}
                </td>
                <td className={`px-4 py-3 text-center font-medium ${scoreTone(cat.avgScore)}`}>
                  {scoreLabel(cat.avgScore)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
