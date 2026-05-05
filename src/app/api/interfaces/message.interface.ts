import type { PaginationMeta } from "./api-response.interface";

export interface MessageRecord {
  id: string;
  senderId: string;
  recipientId: string | null;
  socialNetworkId: string | null;
  content: string;
  createdAt: string | Date;
  updatedAt: string | Date;

  sender: { id: string; name: string; email: string | null };
  recipient?: { id: string; name: string; email: string | null } | null;
  socialNetwork?: { id: string; name: string } | null;
}

export interface CreateMessageDTO {
  content: string;
}

export interface ListMessagesResponse {
  items: MessageRecord[];
  meta: { pagination: PaginationMeta };
}

