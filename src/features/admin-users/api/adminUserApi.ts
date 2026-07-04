// 프론트 전용 mock 사용자 데이터 (관리자용).
export type UserStatus = "활성" | "비활성";
export type UserPlan = "무료" | "프리미엄";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  plan: UserPlan;
  status: UserStatus;
  targetScore: number;
  solved: number;
  joinedAt: string;
  lastActive: string;
}

const USERS: AdminUser[] = [
  { id: "u1", name: "김학생", email: "student.kim@example.com", plan: "프리미엄", status: "활성", targetScore: 850, solved: 342, joinedAt: "2026-03-12", lastActive: "5분 전" },
  { id: "u2", name: "이토익", email: "toeic.lee@example.com", plan: "무료", status: "활성", targetScore: 700, solved: 88, joinedAt: "2026-04-01", lastActive: "2시간 전" },
  { id: "u3", name: "박준영", email: "jy.park@example.com", plan: "프리미엄", status: "활성", targetScore: 900, solved: 512, joinedAt: "2026-02-20", lastActive: "어제" },
  { id: "u4", name: "최민지", email: "minji.choi@example.com", plan: "무료", status: "비활성", targetScore: 600, solved: 24, joinedAt: "2026-05-08", lastActive: "3일 전" },
  { id: "u5", name: "정하늘", email: "haneul.jung@example.com", plan: "프리미엄", status: "활성", targetScore: 800, solved: 267, joinedAt: "2026-03-30", lastActive: "1시간 전" },
  { id: "u6", name: "강도윤", email: "doyun.kang@example.com", plan: "무료", status: "비활성", targetScore: 650, solved: 5, joinedAt: "2026-06-15", lastActive: "2주 전" },
];

export function getAdminUsers(): AdminUser[] {
  return USERS;
}
