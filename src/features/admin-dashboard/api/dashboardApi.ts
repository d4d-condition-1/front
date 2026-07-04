// 프론트 전용 mock: 관리자 대시보드 지표.
export interface DashboardStats {
  totalUsers: number;
  activeToday: number;
  solvedToday: number;
  aiRequests: number;
  recentActivity: { user: string; action: string; time: string }[];
}

const DASHBOARD: DashboardStats = {
  totalUsers: 1284,
  activeToday: 213,
  solvedToday: 4820,
  aiRequests: 19570,
  recentActivity: [
    { user: "김학생", action: "Part 5 · 문법 100제 완료 (18/20)", time: "5분 전" },
    { user: "정하늘", action: "Part 3 · 대화 문제 실전 시작", time: "22분 전" },
    { user: "이토익", action: "회원가입 (무료 플랜)", time: "1시간 전" },
    { user: "박준영", action: "예상 점수 785 → 800 상승", time: "2시간 전" },
    { user: "최민지", action: "Part 7 · 단일 지문 독해 완료 (6/10)", time: "3시간 전" },
  ],
};

export function getDashboard(): DashboardStats {
  return DASHBOARD;
}
