import { reportStatusLabel, type ReportsChildRecord, type ReportRevisionStatus } from './reports-child.interface';

function report(status: ReportRevisionStatus, overrides: Partial<ReportsChildRecord['lifecycle']> = {}): ReportsChildRecord {
  return {
    id: 'report-1', childId: 'child-1', userRole: 'professional',
    author: { id: 'author-1', name: 'Author', email: 'author@example.com' },
    lifecycle: { status, currentRevisionNumber: 1, publishedRevisionNumber: null, hasUnpublishedChanges: status === 'DRAFT', ...overrides },
    revision: {
      id: 'revision-1', revisionNumber: 1, status, title: 'Report', behavior: null,
      difficulty: null, recommendation: null, submittedAt: null, rejectedAt: null,
      rejectionReason: null, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    },
    validation: null,
    capabilities: {
      canView: true, canEditDraft: false, canSubmit: false, canValidate: false,
      canCreateRevision: false, canArchive: false, canRevokeValidation: false,
    },
    createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('reportStatusLabel', () => {
  it('maps Phase 2 lifecycle states without claiming validation', () => {
    expect(reportStatusLabel(report('DRAFT'))).toBe('Rascunho');
    expect(reportStatusLabel(report('SUBMITTED'))).toBe('Aguardando validação');
    expect(reportStatusLabel(report('LEGACY_UNVALIDATED'))).toBe('Legado não validado');
    expect(reportStatusLabel(report('REJECTED'))).toBe('Rejeitado');
  });

  it('prioritizes pending changes when a publication still exists', () => {
    expect(reportStatusLabel(report('DRAFT', { publishedRevisionNumber: 1, currentRevisionNumber: 2, hasUnpublishedChanges: true }))).toBe('Alterações pendentes');
  });
});
