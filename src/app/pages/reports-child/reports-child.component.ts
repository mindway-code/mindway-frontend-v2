import { Component, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { BehaviorSubject, combineLatest, map, take } from "rxjs";
import { AuthService } from "../../services/auth.service";
import { ChildService } from "../../services/child.service";
import { ReportsChildService } from "../../services/reports-child.service";
import type { ChildRecord } from "../../api/interfaces/child.interface";
import type {
  CreateReportsChildDTO,
  ReportsChildRecord,
  UpdateReportsChildDTO,
} from "../../api/interfaces/reports-child.interface";
import type { UserRecord } from "../../api/interfaces/user.interface";

type ReportWithPermissions = ReportsChildRecord & { canManage?: boolean };

@Component({
  selector: "app-reports-child",
  standalone: false,
  templateUrl: "./reports-child.component.html",
  styleUrls: ["./reports-child.component.scss"],
})
export class ReportsChildComponent implements OnInit {
  readonly currentUser$ = this.authService.currentUser$;

  readonly children$ = this.childService.children$;
  readonly childrenLoading$ = this.childService.loading$;
  readonly childrenError$ = this.childService.error$;

  readonly reports$ = this.reportsChildService.reports$;
  readonly reportsLoading$ = this.reportsChildService.loading$;
  readonly saving$ = this.reportsChildService.saving$;
  readonly reportsError$ = this.reportsChildService.error$;
  readonly pagination$ = this.reportsChildService.pagination$;

  private readonly selectedChildIdSubject = new BehaviorSubject<string | null>(null);
  readonly selectedChildId$ = this.selectedChildIdSubject.asObservable();

  readonly selectedChild$ = combineLatest([this.children$, this.selectedChildId$]).pipe(
    map(([children, selectedId]) => children.find((c) => c.id === selectedId) ?? null)
  );

  readonly reportsWithPermissions$ = combineLatest([this.reports$, this.currentUser$, this.selectedChild$]).pipe(
    map(([reports, user, child]) => reports.map((r) => ({ ...r, canManage: this.canManageReport(user, child, r) })))
  );

  selectedChildId: string | null = null;
  editingReport: ReportsChildRecord | null = null;
  showCreateForm = false;

  constructor(
    private readonly authService: AuthService,
    private readonly childService: ChildService,
    private readonly reportsChildService: ReportsChildService
  ) {}

  ngOnInit(): void {
    this.childService
      .loadAccessibleChildren({ page: 1, pageSize: 50 })
      .pipe(take(1))
      .subscribe({
        next: (children) => {
          if (children.length) this.onSelectChild(children[0].id);
        },
        error: () => {
          // Service already exposes a user-friendly error message.
        },
      });

    this.selectedChildId$
      .pipe(takeUntilDestroyed())
      .subscribe((childId) => {
        const normalized = childId?.trim() ?? "";
        if (!normalized) {
          this.reportsChildService.clearState();
          return;
        }

        this.reportsChildService.clearState();
        this.reportsChildService.loadByChildId(normalized, { page: 1, pageSize: 20 }).subscribe();
      });
  }

  onSelectChild(childId: string): void {
    const normalized = childId?.trim() ?? "";
    this.selectedChildId = normalized || null;
    this.editingReport = null;
    this.showCreateForm = false;
    this.selectedChildIdSubject.next(this.selectedChildId);
  }

  onOpenCreate(): void {
    if (!this.selectedChildId) return;
    this.editingReport = null;
    this.showCreateForm = true;
  }

  onEditReport(report: ReportsChildRecord): void {
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
      .subscribe({
        next: () => this.onCancelForm(),
        error: () => {
          // Service already exposes a user-friendly error message.
        },
      });
  }

  onUpdateReport(payload: UpdateReportsChildDTO): void {
    if (!this.editingReport) return;

    this.reportsChildService
      .updateReport(this.editingReport.id, payload)
      .pipe(take(1))
      .subscribe({
        next: () => this.onCancelForm(),
        error: () => {
          // Service already exposes a user-friendly error message.
        },
      });
  }

  onDeleteReport(report: ReportWithPermissions): void {
    if (!report.canManage) return;
    if (!confirm("Are you sure you want to delete this report?")) return;

    this.reportsChildService
      .deleteReport(report.id)
      .pipe(take(1))
      .subscribe({
        next: () => {},
        error: () => {
          // Service already exposes a user-friendly error message.
        },
      });
  }

  private canManageReport(user: UserRecord | null, child: ChildRecord | null, report: ReportsChildRecord): boolean {
    const userId = user?.id ?? null;
    const role = user?.role ?? null;
    if (!userId) return false;
    if (role === "admin") return true;

    const isResponsible = child?.responsibleId === userId;
    const isSecondaryResponsible = child?.secondaryResponsibleId === userId;
    if (isResponsible || isSecondaryResponsible) return true;

    return report.userId === userId;
  }
}
