import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import type { PaginationMeta } from '../../../../api/interfaces/api-response.interface';
import {
  reportStatusLabel,
  type ReportsChildRecord,
} from '../../../../api/interfaces/reports-child.interface';

export type ReportsChildListItem = ReportsChildRecord;

export function hasReportManagementCapability(report: ReportsChildRecord): boolean {
  return report.capabilities.canEditDraft || report.capabilities.canSubmit || report.capabilities.canCreateRevision || report.capabilities.canArchive;
}

@Component({
  selector: 'app-reports-child-list',
  standalone: false,
  templateUrl: './reports-child-list.component.html',
  styleUrl: './reports-child-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsChildListComponent {
  readonly hasManagementCapability = hasReportManagementCapability;
  readonly statusLabel = reportStatusLabel;
  openMenuId: string | null = null;
  menuPosition: 'above' | 'below' = 'below';
  menuMaxHeight = 0;
  @Input() reports: ReportsChildListItem[] = [];
  @Input() loading = false;
  @Input() pagination: PaginationMeta | null = null;
  @Input() hasActiveFilters = false;
  @Input() selectedReportId: string | null = null;

  @Output() selectionChange = new EventEmitter<ReportsChildListItem | null>();
  @Output() open = new EventEmitter<ReportsChildListItem>();
  @Output() edit = new EventEmitter<ReportsChildRecord>();
  @Output() delete = new EventEmitter<ReportsChildListItem>();
  @Output() submitDraft = new EventEmitter<ReportsChildListItem>();
  @Output() createRevision = new EventEmitter<ReportsChildListItem>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() clearFilters = new EventEmitter<void>();

  reportAuthor(report: ReportsChildRecord): string {
    return report.author.name || report.author.email || 'Autor não identificado';
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

  toggleMobileMenu(reportId: string, event: MouseEvent): void {
    if (this.openMenuId === reportId) {
      this.openMenuId = null;
      return;
    }

    const trigger = event.currentTarget as HTMLElement;
    const bounds = trigger.getBoundingClientRect();
    const spaceAbove = bounds.top - 8;
    const spaceBelow = window.innerHeight - bounds.bottom - 8;

    this.menuPosition = spaceBelow >= spaceAbove ? 'below' : 'above';
    this.menuMaxHeight = Math.max(0, this.menuPosition === 'below' ? spaceBelow : spaceAbove);
    this.openMenuId = reportId;
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
