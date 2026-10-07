import { Component, DestroyRef, OnInit, inject } from "@angular/core";
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
type ReportFilter = "all" | "school" | "therapist" | "professional";

@Component({
  selector: "app-reports-child",
  standalone: false,
  templateUrl: "./reports-child.component.html",
  styleUrls: ["./reports-child.component.scss"],
})
export class ReportsChildComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

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
  readonly reportSummary$ = combineLatest([this.selectedChild$, this.reportsWithPermissions$]).pipe(
    map(([child, reports]) => {
      const latestCreatedAt = reports.length
        ? [...reports]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
            ?.createdAt ?? null
        : null;
      const now = new Date();
      const currentMonthReports = reports.filter((report) => {
        const createdAt = new Date(report.createdAt);
        return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
      }).length;

      return {
        child,
        totalReports: reports.length,
        currentMonthReports,
        manageableReports: reports.filter((report) => report.canManage).length,
        latestCreatedAt,
      };
    })
  );

  selectedChildId: string | null = null;
  editingReport: ReportsChildRecord | null = null;
  showCreateForm = false;
  searchTerm = "";
  activeFilter: ReportFilter = "all";
  sortOrder: "recent" | "oldest" = "recent";

  constructor(
    private readonly authService: AuthService,
    private readonly childService: ChildService,
    private readonly reportsChildService: ReportsChildService
  ) {}

  ngOnInit(): void {
    this.loadChildren();

    this.selectedChildId$
      .pipe(takeUntilDestroyed(this.destroyRef))
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

  retryLoadChildren(): void {
    this.loadChildren();
  }

  private loadChildren(): void {
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
    if (!confirm("Tem certeza de que deseja excluir este relatório?")) return;

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

  visibleReports(reports: ReportWithPermissions[] | null): ReportWithPermissions[] {
    const normalizedSearch = this.searchTerm.trim().toLowerCase();

    return [...(reports ?? [])]
      .filter((report) => this.matchesFilter(report))
      .filter((report) => {
        if (!normalizedSearch) return true;

        return [report.title, report.behavior, report.difficulty, report.recommendation, report.user?.name, report.user?.email]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedSearch));
      })
      .sort((a, b) => {
        const difference = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return this.sortOrder === "recent" ? difference : -difference;
      });
  }

  reportType(report: ReportsChildRecord): string {
    const labels: Record<string, string> = {
      enterprise: "Escola",
      therapist: "Terapeuta",
      professional: "Profissional",
      common: "Responsável",
      admin: "Administração",
    };

    return labels[report.userRole] ?? "Relatório";
  }

  reportDescription(report: ReportsChildRecord): string {
    return report.behavior || report.difficulty || report.recommendation || "Relatório compartilhado para acompanhamento.";
  }

  reportAuthor(report: ReportsChildRecord): string {
    return report.user?.name || report.user?.email || "Profissional não identificado";
  }

  reportInitial(report: ReportsChildRecord): string {
    return this.reportType(report).charAt(0);
  }

  downloadReport(report: ReportsChildRecord): void {
    const content = [
      report.title,
      "",
      `Profissional: ${this.reportAuthor(report)}`,
      `Data: ${new Date(report.createdAt).toLocaleDateString("pt-BR")}`,
      report.behavior ? `Comportamento: ${report.behavior}` : "",
      report.difficulty ? `Dificuldade: ${report.difficulty}` : "",
      report.recommendation ? `Recomendação: ${report.recommendation}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.title.replace(/[^a-z0-9]/gi, "-").toLowerCase() || "relatorio"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  clearFilters(): void {
    this.searchTerm = "";
    this.activeFilter = "all";
    this.sortOrder = "recent";
  }

  private matchesFilter(report: ReportsChildRecord): boolean {
    if (this.activeFilter === "all") return true;
    if (this.activeFilter === "school") return report.userRole === "enterprise";
    return report.userRole === this.activeFilter;
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
