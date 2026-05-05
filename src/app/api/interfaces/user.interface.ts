export type UserRole = "admin" | "therapist" | "common" | "enterprise" | "professional";

export interface UserRecord {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: UserRole | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface UserDTO {
  name: string;
  email?: string | null;
  password?: string | null;
  role: UserRole;
  provider?: "local" | "google";
  googleId?: string;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string | null;
  password?: string;
  role?: UserRole;
  provider?: "local" | "google";
  googleId?: string;
}

