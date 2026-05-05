import type { PaginationMeta } from "./api-response.interface";

export type FamilyMemberRole = "child" | "enterprise" | "manager" | "therapist" | "professional";

export interface FamilyMemberRecord {
  id: string;
  userId: string;
  familyId: string;
  role: FamilyMemberRole;
  createdAt: string | Date;
  updatedAt: string | Date;

  user?: { id: string; name: string; email: string | null };
  family?: { id: string; name: string };
}

export interface CreateFamilyMemberDTO {
  userId: string;
  familyId: string;
  role: FamilyMemberRole;
}

export interface UpdateFamilyMemberDTO {
  userId?: string;
  familyId?: string;
  role?: FamilyMemberRole;
}

export interface ListFamilyMembersResponse {
  items: FamilyMemberRecord[];
  meta: { pagination: PaginationMeta };
}

