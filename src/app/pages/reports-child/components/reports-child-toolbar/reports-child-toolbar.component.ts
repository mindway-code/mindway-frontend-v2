import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

export type ReportAccessFilter = 'all' | 'manageable' | 'shared';
export type ReportSortOrder = 'recent' | 'oldest';

@Component({
  selector: 'app-reports-child-toolbar',
  standalone: false,
  templateUrl: './reports-child-toolbar.component.html',
  styleUrl: './reports-child-toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsChildToolbarComponent {
  @Input() accessFilter: ReportAccessFilter = 'all';
  @Input() sortOrder: ReportSortOrder = 'recent';
  @Input() canCreate = false;
  @Input() filtersVisible = true;
  @Input() hasSelection = false;

  @Output() accessFilterChange = new EventEmitter<ReportAccessFilter>();
  @Output() sortOrderChange = new EventEmitter<ReportSortOrder>();
  @Output() clear = new EventEmitter<void>();
  @Output() create = new EventEmitter<void>();
  @Output() openSelected = new EventEmitter<void>();

  get hasFilters(): boolean {
    return this.accessFilter !== 'all' || this.sortOrder !== 'recent';
  }

  updateAccessFilter(event: Event): void {
    this.accessFilterChange.emit((event.target as HTMLSelectElement).value as ReportAccessFilter);
  }

  updateSort(event: Event): void {
    this.sortOrderChange.emit((event.target as HTMLSelectElement).value as ReportSortOrder);
  }
}
