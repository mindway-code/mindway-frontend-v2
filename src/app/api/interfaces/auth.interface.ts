import type { UserRole, UserRecord } from "./user.interface";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: UserRole;
  provider?: "local" | "google";
  googleId?: string | null;
}

export interface AuthTokens {
  accessToken: string;
}

export interface AuthState {
  accessToken: string | null;
  currentUser: UserRecord | null;
}

