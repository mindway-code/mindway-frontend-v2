import type { UserRole } from './user.interface';

export type ReportRevisionStatus =
  | 'LEGACY_UNVALIDATED'
  | 'DRAFT'
  | 'SUBMITTED'
  | 'VALIDATED'
  | 'REJECTED'
  | 'SUPERSEDED';

export interface ReportCapabilities {
  canView: boolean;
  canEditDraft: boolean;
  canSubmit: boolean;
  canValidate: boolean;
  canCreateRevision: boolean;
  canArchive: boolean;
  canRevokeValidation: boolean;
}

export interface ReportRevisionView {
  id: string;
  revisionNumber: number;
  status: ReportRevisionStatus;
  title: string;
  behavior: string | null;
  difficulty: string | null;
  recommendation: string | null;
  submittedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReportsChildRecord {
  id: string;
  childId: string;
  userRole: UserRole;
  author: { id: string; name: string | null; email: string | null };
  lifecycle: {
    status: ReportRevisionStatus;
    currentRevisionNumber: number;
    publishedRevisionNumber: number | null;
    hasUnpublishedChanges: boolean;
  };
  revision: ReportRevisionView;
  validation: null;
  capabilities: ReportCapabilities;
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

export function reportStatusLabel(report: ReportsChildRecord): string {
  if (report.lifecycle.hasUnpublishedChanges && report.lifecycle.publishedRevisionNumber !== null) {
    return 'Alterações pendentes';
  }
  const labels: Record<ReportRevisionStatus, string> = {
    DRAFT: 'Rascunho',
    SUBMITTED: 'Aguardando validação',
    LEGACY_UNVALIDATED: 'Legado não validado',
    REJECTED: 'Rejeitado',
    VALIDATED: 'Publicado',
    SUPERSEDED: 'Substituído',
  };
  return labels[report.lifecycle.status];
}
