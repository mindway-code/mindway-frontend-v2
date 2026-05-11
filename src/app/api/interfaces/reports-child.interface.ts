import type { UserRole } from "./user.interface";

export interface ReportsChildRecord {
  id: string;
  childId: string;
  userId: string;
  userRole: UserRole;
  title: string;
  behavior?: string | null;
  difficulty?: string | null;
  recommendation?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReportsChildDTO {
  title: string;
  behavior?: string | null;
  difficulty?: string | null;
  recommendation?: string | null;
  accessCode?: string;
}

export interface UpdateReportsChildDTO {
  title?: string;
  behavior?: string | null;
  difficulty?: string | null;
  recommendation?: string | null;
}

