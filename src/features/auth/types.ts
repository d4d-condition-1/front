export type Role = "trainee" | "admin";

export interface User {
  id: string;
  loginId: string;
  name: string;
  rank: string;
  unit: string;
  role: Role;
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
}
