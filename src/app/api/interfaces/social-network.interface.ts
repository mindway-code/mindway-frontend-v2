import type { PaginationMeta } from "./api-response.interface";

export interface SocialNetworkRecord {
  id: string;
  name: string;
  description: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  users?: { id: string; userId: string }[];
}

export interface CreateSocialNetworkDTO {
  name: string;
  description?: string | null;
}

export interface UpdateSocialNetworkDTO {
  name?: string;
  description?: string | null;
}

export interface ListSocialNetworksResponse {
  items: SocialNetworkRecord[];
  meta: { pagination: PaginationMeta };
}

