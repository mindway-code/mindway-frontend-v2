import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import type { PaginationMeta } from '../../../../api/interfaces/api-response.interface';
import type { ReportsChildRecord } from '../../../../api/interfaces/reports-child.interface';

export type ReportsChildListItem = ReportsChildRecord & { canManage?: boolean };

@Component({
  selector: 'app-reports-child-list',
  standalone: false,
  templateUrl: './reports-child-list.component.html',
  styleUrl: './reports-child-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsChildListComponent {
  openMenuId: string | null = null;
  @Input() reports: ReportsChildListItem[] = [];
  @Input() loading = false;
  @Input() pagination: PaginationMeta | null = null;
  @Input() hasActiveFilters = false;
  @Input() selectedReportId: string | null = null;

  @Output() selectionChange = new EventEmitter<ReportsChildListItem | null>();
  @Output() open = new EventEmitter<ReportsChildListItem>();
  @Output() edit = new EventEmitter<ReportsChildRecord>();
  @Output() delete = new EventEmitter<ReportsChildListItem>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() clearFilters = new EventEmitter<void>();

  reportAuthor(report: ReportsChildRecord): string {
    return report.user?.name || report.user?.email || 'Autor não identificado';
  }

  authorInitial(report: ReportsChildRecord): string {
    return this.reportAuthor(report).charAt(0).toUpperCase() || 'A';
  }

  roleLabel(report: ReportsChildRecord): string {
    const labels: Record<string, string> = {
      enterprise: 'Escola ou clínica',
      therapist: 'Terapia',
      professional: 'Profissional',
      common: 'Responsável',
      admin: 'Administração',
    };
    return labels[report.userRole] ?? 'Relatório';
  }

  trackById(_index: number, report: ReportsChildRecord): string {
    return report.id;
  }

  toggleSelection(report: ReportsChildListItem, checked: boolean): void {
    this.selectionChange.emit(checked ? report : null);
  }

  toggleMobileMenu(reportId: string): void {
    this.openMenuId = this.openMenuId === reportId ? null : reportId;
  }

  selectFromMenu(report: ReportsChildListItem): void {
    this.toggleSelection(report, this.selectedReportId !== report.id);
    this.openMenuId = null;
  }

  @HostListener('document:keydown.escape')
  closeMenuOnEscape(): void {
    this.openMenuId = null;
  }

  @HostListener('document:click', ['$event'])
  closeMenuOnOutside(event: MouseEvent): void {
    if (!(event.target as HTMLElement).closest('.reports-table__more')) this.openMenuId = null;
  }
}
