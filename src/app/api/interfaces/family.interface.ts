import type { PaginationMeta } from "./api-response.interface";

export interface FamilyRecord {
  id: string;
  name: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateFamilyDTO {
  name: string;
}

export interface UpdateFamilyDTO {
  name?: string;
}

export interface ListFamiliesResponse {
  items: FamilyRecord[];
  meta: { pagination: PaginationMeta };
}

