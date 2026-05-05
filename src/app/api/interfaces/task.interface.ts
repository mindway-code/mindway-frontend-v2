import type { PaginationMeta } from "./api-response.interface";

export type TaskStatus = "pending" | "in_progress" | "done" | "canceled";

export interface TaskRecord {
  id: string;
  therapistId: string;
  userId: string;
  status: TaskStatus | string;
  title: string;
  description: string | null;
  feedback: string | null;
  note: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;

  therapist?: { id: string; name: string; email: string | null };
  user?: { id: string; name: string; email: string | null };
}

export interface CreateTaskDTO {
  therapistId: string;
  userId: string;
  status?: TaskStatus;
  title: string;
  description?: string | null;
  feedback?: string | null;
  note?: string | null;
}

export interface UpdateTaskDTO {
  status: TaskStatus;
  title?: string;
  description?: string | null;
  feedback?: string | null;
  note?: string | null;
}

export interface ListTasksResponse {
  items: TaskRecord[];
  meta: { pagination: PaginationMeta };
}

