// 프론트 전용 mock: 관리자 대시보드 — 부대 전체 현황.
export interface DashboardStats {
  totalTrainees: number;
  avgProficiency: number;
  trainedToday: number;
  aiRequests: number;
  gradeDist: { grade: string; count: number }[];
  recentActivity: { user: string; action: string; time: string }[];
}

const DASHBOARD: DashboardStats = {
  totalTrainees: 128,
  avgProficiency: 64,
  trainedToday: 83,
  aiRequests: 19570,
  gradeDist: [
    { grade: "S", count: 8 },
    { grade: "A", count: 27 },
    { grade: "B", count: 44 },
    { grade: "C", count: 35 },
    { grade: "D", count: 14 },
  ],
  recentActivity: [
    { user: "박병장", action: "전술기동 훈련 완료 (8/8) · 등급 A 유지", time: "5분 전" },
    { user: "정하사", action: "화력운용 점수 78 → 84 상승", time: "22분 전" },
    { user: "최이병", action: "진단 테스트 완료 · 초기 등급 D", time: "1시간 전" },
    { user: "김일병", action: "화생방 약점 집중 훈련 시작", time: "2시간 전" },
    { user: "이상병", action: "전장응급처치 Lv.4 문항 정답", time: "3시간 전" },
  ],
};

export function getDashboard(): DashboardStats {
  return DASHBOARD;
}
