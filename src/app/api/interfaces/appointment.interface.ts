import type { PaginationMeta } from "./api-response.interface";

export type AppointmentStatus = "scheduled" | "confirmed" | "completed" | "canceled" | "no_show";

export interface AppointmentRecord {
  id: string;
  therapistId: string;
  userId: string;
  status: AppointmentStatus;
  title: string | null;
  startsAt: string | Date;
  endsAt: string | Date;
  note: string | null;
  feedback: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  therapist: { id: string; name: string; email?: string | null };
  user: { id: string; name: string; email?: string | null };
}

export interface CreateAppointmentDTO {
  therapistId?: string;
  userId?: string;
  status?: AppointmentStatus;
  title?: string | null;
  startsAt?: string | Date;
  endsAt?: string | Date;
  note?: string | null;
  feedback?: string | null;
}

export interface UpdateAppointmentDTO {
  status?: AppointmentStatus;
  title?: string | null;
  startsAt?: string | Date;
  endsAt?: string | Date;
  note?: string | null;
  feedback?: string | null;
}

export interface ListAppointmentsResponse {
  items: AppointmentRecord[];
  meta: { pagination: PaginationMeta };
}

