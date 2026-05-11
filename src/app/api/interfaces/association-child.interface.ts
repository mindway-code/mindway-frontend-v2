import type { ChildRecord } from "./child.interface";

export interface AssociationChildRecord {
  id: string;
  userId: string;
  childId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssociationChildDTO {
  accessCode: string;
}

export interface AssociateChildResult {
  child: ChildRecord;
  association: AssociationChildRecord | null;
  alreadyHadAccess: boolean;
}

