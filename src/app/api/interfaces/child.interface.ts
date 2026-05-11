import type { AnamnesisRecord } from "./anamnesis.interface";

export interface ChildRecord {
  id: string;
  responsibleId: string;
  secondaryResponsibleId?: string | null;
  name: string;
  age: number;
  birthDate: string;
  observation?: string | null;
  accessCode: string;
  createdAt: string;
  updatedAt: string;
  anamnesis?: AnamnesisRecord | null;
}

export interface CreateChildDTO {
  name: string;
  age: number;
  birthDate: string;
  observation?: string | null;
  secondaryResponsibleId?: string | null;
}
