import type { PublicRegistrationRole, UserRecord } from './user.interface';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: PublicRegistrationRole;
}

export interface AuthTokens {
  accessToken: string;
}

export interface AuthState {
  accessToken: string | null;
  currentUser: UserRecord | null;
}
