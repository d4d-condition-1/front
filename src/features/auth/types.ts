export type Role = "trainee" | "admin" | "super_admin";

export interface User {
  id: string;
  loginId: string;
  name: string;
  rank: string;
  unit: string; // 세부 소속 (자유 입력: 소대/분대)
  role: Role;
  unitId: string | null;
  unitName: string | null; // 소속 부대 (부대 코드로 매핑)
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresAt: string;
}

export interface RegisterInput {
  loginId: string;
  password: string;
  name: string;
  rank?: string;
  unit?: string;
  /** 부대 코드. 장병 가입은 필수, 관리자는 선택(입력 시 해당 부대 담당) */
  unitCode?: string;
  /** 가입 역할. 'admin' 은 adminCode(관리자 가입 코드) 필수 */
  role?: Role;
  adminCode?: string;
}
