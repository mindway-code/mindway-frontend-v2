import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, firstValueFrom, of } from 'rxjs';
import type { ReportsChildRecord } from '../../api/interfaces/reports-child.interface';
import { ReportsChildComponent } from './reports-child.component';

function report(
  id: string,
  title: string,
  capabilities: Partial<ReportsChildRecord['capabilities']> = {},
  createdAt = '2026-11-20T12:00:00.000Z',
): ReportsChildRecord {
  return {
    id,
    childId: 'child-1',
    userRole: 'common',
    author: { id: 'user-1', name: 'Maria Silva', email: 'maria@example.test' },
    lifecycle: {
      status: 'DRAFT',
      currentRevisionNumber: 1,
      publishedRevisionNumber: null,
      hasUnpublishedChanges: true,
    },
    revision: {
      id: `revision-${id}`,
      revisionNumber: 1,
      status: 'DRAFT',
      contentHash: 'a'.repeat(64),
      title,
      behavior: null,
      difficulty: null,
      recommendation: null,
      submittedAt: null,
      rejectedAt: null,
      rejectionReason: null,
      createdAt,
      updatedAt: createdAt,
    },
    validation: null,
    capabilities: {
      canView: true,
      canEditDraft: false,
      canSubmit: false,
      canValidate: false,
      canCreateRevision: false,
      canArchive: false,
      canRevokeValidation: false,
      ...capabilities,
    },
    createdAt,
    updatedAt: createdAt,
  };
}

describe('ReportsChildComponent business rules', () => {
  let reportsSubject: BehaviorSubject<ReportsChildRecord[]>;
  let reportsService: any;
  let childService: any;
  let component: ReportsChildComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    reportsSubject = new BehaviorSubject<ReportsChildRecord[]>([]);
    reportsService = {
      reports$: reportsSubject,
      loading$: of(false),
      saving$: of(false),
      error$: of(null),
      pagination$: of(null),
      clearState: jasmine.createSpy('clearState'),
      loadByChildId: jasmine.createSpy('loadByChildId').and.returnValue(of([])),
      createReport: jasmine.createSpy('createReport').and.returnValue(of(report('new', 'New'))),
      updateReport: jasmine.createSpy('updateReport').and.returnValue(of(report('r1', 'Updated'))),
      deleteReport: jasmine.createSpy('deleteReport').and.returnValue(of(void 0)),
      submitReport: jasmine.createSpy('submitReport'),
      createRevision: jasmine.createSpy('createRevision'),
    };
    childService = {
      children$: of([{ id: 'child-1', name: 'Child' }]),
      loading$: of(false),
      loadAccessibleChildren: jasmine.createSpy('loadAccessibleChildren').and.returnValue(of([])),
    };
    const authService = { currentUser$: of({ id: 'user-1', role: 'common' }) };
    component = TestBed.runInInjectionContext(
      () => new ReportsChildComponent(authService as any, childService, reportsService),
    );
  });

  it('selects a child, resets transient state and loads its first report page', () => {
    component.selectedReport = report('old', 'Old');
    component.reportInView = component.selectedReport;
    component.onSelectChild(' child-1 ');

    expect(component.selectedChildId).toBe('child-1');
    expect(component.selectedReport).toBeNull();
    expect(component.reportInView).toBeNull();
    expect(reportsService.clearState).toHaveBeenCalled();
    expect(reportsService.loadByChildId).toHaveBeenCalledWith('child-1', {
      page: 1,
      pageSize: 20,
    });
  });

  it('filters reports by normalized search and management capability', async () => {
    const manageable = report('r1', 'Relatorio Clinico', { canEditDraft: true });
    const shared = report('r2', 'Observacao Escolar');
    reportsSubject.next([shared, manageable]);

    component.onSearchChange('clinico');
    component.onAccessFilterChange('manageable');

    const visible = await firstValueFrom(component.visibleReports$);
    expect(visible.map((item) => item.id)).toEqual(['r1']);
  });

  it('enforces submit capability and updates the opened report after submission', () => {
    const denied = report('r1', 'Draft');
    component.onSubmitWorkflow(denied);
    expect(reportsService.submitReport).not.toHaveBeenCalled();

    const allowed = report('r1', 'Draft', { canSubmit: true });
    const submitted = {
      ...allowed,
      lifecycle: { ...allowed.lifecycle, status: 'SUBMITTED' as const },
    };
    spyOn(window, 'confirm').and.returnValue(true);
    reportsService.submitReport.and.returnValue(of(submitted));
    component.onSubmitWorkflow(allowed);

    expect(reportsService.submitReport).toHaveBeenCalledWith('r1');
    expect(component.reportInView).toBe(submitted);
  });

  it('opens a newly created revision for editing', () => {
    const validated = report('r1', 'Published', { canCreateRevision: true });
    const draft = report('r1', 'Revision 2', { canEditDraft: true });
    reportsService.createRevision.and.returnValue(of(draft));

    component.onCreateRevision(validated);

    expect(reportsService.createRevision).toHaveBeenCalledWith('r1');
    expect(component.editingReport).toBe(draft);
    expect(component.reportInView).toBeNull();
  });
});
