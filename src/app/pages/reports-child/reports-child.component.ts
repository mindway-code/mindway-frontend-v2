import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, combineLatest, map, take } from 'rxjs';
import type {
  CreateReportsChildDTO,
  ReportsChildRecord,
  UpdateReportsChildDTO,
} from '../../api/interfaces/reports-child.interface';
import { AuthService } from '../../services/auth.service';
import { ChildService } from '../../services/child.service';
import { ReportsChildService } from '../../services/reports-child.service';
import type {
  ReportAccessFilter,
  ReportSortOrder,
} from './components/reports-child-toolbar/reports-child-toolbar.component';

export type ReportWithPermissions = ReportsChildRecord;

@Component({
  selector: 'app-reports-child',
  standalone: false,
  templateUrl: './reports-child.component.html',
  styleUrl: './reports-child.component.scss',
})
export class ReportsChildComponent implements OnInit {
  readonly today = new Date();
  private readonly destroyRef = inject(DestroyRef);
  private readonly selectedChildIdSubject = new BehaviorSubject<string | null>(null);
  private readonly searchSubject = new BehaviorSubject('');
  private readonly accessFilterSubject = new BehaviorSubject<ReportAccessFilter>('all');
  private readonly sortSubject = new BehaviorSubject<ReportSortOrder>('recent');

  readonly children$ = this.childService.children$;
  readonly currentUser$ = this.authService.currentUser$;
  readonly childrenLoading$ = this.childService.loading$;
  readonly reportsLoading$ = this.reportsChildService.loading$;
  readonly saving$ = this.reportsChildService.saving$;
  readonly reportsError$ = this.reportsChildService.error$;
  readonly pagination$ = this.reportsChildService.pagination$;
  readonly selectedChildId$ = this.selectedChildIdSubject.asObservable();

  readonly selectedChild$ = combineLatest([this.children$, this.selectedChildId$]).pipe(
    map(([children, selectedId]) => children.find((child) => child.id === selectedId) ?? null),
  );

  readonly canCreateReport$ = combineLatest([
    this.selectedChild$,
    this.authService.currentUser$,
  ]).pipe(
    map(([child, user]) => !!child && !!user),
  );

  readonly reportsWithPermissions$ = this.reportsChildService.reports$;

  readonly visibleReports$ = combineLatest([
    this.reportsWithPermissions$,
    this.searchSubject,
    this.accessFilterSubject,
    this.sortSubject,
  ]).pipe(
    map(([reports, searchTerm, accessFilter, sortOrder]) => {
      const search = this.normalize(searchTerm);

      return [...reports]
        .filter((report) => {
          if (accessFilter === 'manageable' && !this.hasManagementCapability(report)) return false;
          if (accessFilter === 'shared' && this.hasManagementCapability(report)) return false;
          if (!search) return true;

          return this.normalize(
            [
              report.revision.title,
              report.revision.behavior,
              report.revision.difficulty,
              report.revision.recommendation,
              report.author.name,
              report.author.email,
              this.reportType(report),
            ]
              .filter(Boolean)
              .join(' '),
          ).includes(search);
        })
        .sort((a, b) => {
          const difference = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          return sortOrder === 'recent' ? difference : -difference;
        });
    }),
  );

  selectedChildId: string | null = null;
  selectedReport: ReportWithPermissions | null = null;
  reportInView: ReportWithPermissions | null = null;
  editingReport: ReportsChildRecord | null = null;
  showCreateForm = false;
  searchTerm = '';
  accessFilter: ReportAccessFilter = 'all';
  sortOrder: ReportSortOrder = 'recent';

  constructor(
    private readonly authService: AuthService,
    private readonly childService: ChildService,
    private readonly reportsChildService: ReportsChildService,
  ) {}

  ngOnInit(): void {
    this.childService
      .loadAccessibleChildren({ page: 1, pageSize: 50 })
      .pipe(take(1))
      .subscribe({
        next: (children) => {
          if (children.length) this.onSelectChild(children[0].id);
        },
      });
  }

  onSelectChild(childId: string): void {
    const normalized = childId?.trim() ?? '';
    if (!normalized) return;

    this.selectedChildId = normalized;
    this.selectedReport = null;
    this.reportInView = null;
    this.onCancelForm();
    this.selectedChildIdSubject.next(normalized);
    this.clearFilters();
    this.loadReports(1);
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.selectedReport = null;
    this.searchSubject.next(value);
  }

  onAccessFilterChange(value: ReportAccessFilter): void {
    this.accessFilter = value;
    this.selectedReport = null;
    this.accessFilterSubject.next(value);
  }

  onSortChange(value: ReportSortOrder): void {
    this.sortOrder = value;
    this.sortSubject.next(value);
  }

  clearFilters(): void {
    this.onSearchChange('');
    this.onAccessFilterChange('all');
    this.onSortChange('recent');
  }

  onOpenCreate(): void {
    if (!this.selectedChildId) return;
    this.editingReport = null;
    this.showCreateForm = true;
  }

  onOpenReport(report: ReportWithPermissions): void {
    this.reportInView = report;
  }

  onCloseReport(): void {
    this.reportInView = null;
  }

  onSelectReport(report: ReportWithPermissions | null): void {
    this.selectedReport = report;
  }

  printSelectedReport(): void {
    if (!this.selectedReport) return;
    window.print();
  }

  onEditReport(report: ReportsChildRecord): void {
    if (!report.capabilities.canEditDraft) return;
    this.reportInView = null;
    this.editingReport = report;
    this.showCreateForm = false;
  }

  onCancelForm(): void {
    this.editingReport = null;
    this.showCreateForm = false;
  }

  onCreateReport(payload: CreateReportsChildDTO | UpdateReportsChildDTO): void {
    if (!this.selectedChildId) return;

    this.reportsChildService
      .createReport(this.selectedChildId, payload as CreateReportsChildDTO)
      .pipe(take(1))
      .subscribe({ next: () => this.onCancelForm() });
  }

  onUpdateReport(payload: UpdateReportsChildDTO): void {
    if (!this.editingReport) return;

    this.reportsChildService
      .updateReport(this.editingReport.id, payload)
      .pipe(take(1))
      .subscribe({ next: () => this.onCancelForm() });
  }

  onSubmitReport(payload: CreateReportsChildDTO | UpdateReportsChildDTO): void {
    if (this.editingReport) {
      this.onUpdateReport(payload as UpdateReportsChildDTO);
      return;
    }

    this.onCreateReport(payload);
  }

  onDeleteReport(report: ReportWithPermissions): void {
    if (!report.capabilities.canArchive) return;
    if (!confirm('Arquivar este relatório? O histórico de revisões será preservado.')) return;

    this.reportsChildService
      .deleteReport(report.id)
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          if (this.selectedReport?.id === report.id) this.selectedReport = null;
          this.onCloseReport();
        },
      });
  }

  onSubmitWorkflow(report: ReportWithPermissions): void {
    if (!report.capabilities.canSubmit) return;
    if (!confirm('Enviar este rascunho? Após o envio, o conteúdo não poderá ser editado.')) return;

    this.reportsChildService
      .submitReport(report.id)
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (updated) => (this.reportInView = updated) });
  }

  onCreateRevision(report: ReportWithPermissions): void {
    if (!report.capabilities.canCreateRevision) return;

    this.reportsChildService
      .createRevision(report.id)
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.reportInView = updated;
          this.onEditReport(updated);
        },
      });
  }

  onPageChange(page: number): void {
    this.selectedReport = null;
    this.loadReports(page);
  }

  reportType(report: ReportsChildRecord): string {
    const labels: Record<string, string> = {
      enterprise: 'Escola ou clínica',
      therapist: 'Terapia',
      professional: 'Profissional',
      common: 'Responsável',
      admin: 'Administração',
    };
    return labels[report.userRole] ?? 'Relatório';
  }

  getFirstName(name: string | null | undefined, email: string | null | undefined): string {
    const displayName = name?.trim() || email?.split('@')[0]?.trim() || 'Usuário';
    return displayName.split(/\s+/)[0];
  }

  getUserInitial(name: string | null | undefined, email: string | null | undefined): string {
    return this.getFirstName(name, email).charAt(0).toLocaleUpperCase('pt-BR');
  }

  getUserPhoto(userId: string): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(`mindway-account-photo-${userId}`);
  }

  countShared(reports: ReportWithPermissions[]): number {
    return reports.filter((report) => !this.hasManagementCapability(report)).length;
  }

  countManageable(reports: ReportWithPermissions[]): number {
    return reports.filter((report) => this.hasManagementCapability(report)).length;
  }

  private loadReports(page: number): void {
    if (!this.selectedChildId) return;
    this.reportsChildService.clearState();
    this.reportsChildService
      .loadByChildId(this.selectedChildId, { page, pageSize: 20 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR')
      .trim();
  }

  private hasManagementCapability(report: ReportsChildRecord): boolean {
    return report.capabilities.canEditDraft || report.capabilities.canSubmit || report.capabilities.canCreateRevision || report.capabilities.canArchive;
  }
}
