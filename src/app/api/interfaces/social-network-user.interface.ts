import type { PaginationMeta } from "./api-response.interface";

export interface SocialNetworkUserRecord {
  id: string;
  socialNetworkId: string;
  userId: string;
  createdAt: string | Date;
  updatedAt: string | Date;

  socialNetwork?: { id: string; name: string };
  user?: { id: string; name: string; email: string | null };
}

export interface CreateSocialNetworkUserDTO {
  socialNetworkId: string;
  userId: string;
}

export interface UpdateSocialNetworkUserDTO {
  socialNetworkId?: string;
  userId?: string;
}

export interface ListSocialNetworkUsersResponse {
  items: SocialNetworkUserRecord[];
  meta: { pagination: PaginationMeta };
}

