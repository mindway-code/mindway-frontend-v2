import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
} from '@angular/core';

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
  @ViewChild('filterTrigger') filterTrigger?: ElementRef<HTMLButtonElement>;
  @ViewChild('filterDialog') filterDialog?: ElementRef<HTMLElement>;

  @Input() accessFilter: ReportAccessFilter = 'all';
  @Input() sortOrder: ReportSortOrder = 'recent';
  @Input() canCreate = false;
  @Input() hasSelection = false;

  @Output() accessFilterChange = new EventEmitter<ReportAccessFilter>();
  @Output() sortOrderChange = new EventEmitter<ReportSortOrder>();
  @Output() create = new EventEmitter<void>();
  @Output() printSelected = new EventEmitter<void>();

  dialogOpen = false;
  draftAccessFilter: ReportAccessFilter = 'all';

  get hasFilters(): boolean {
    return this.accessFilter !== 'all';
  }

  openFilterDialog(): void {
    this.draftAccessFilter = this.accessFilter;
    this.dialogOpen = true;
    setTimeout(() => this.filterDialog?.nativeElement.focus());
  }

  closeFilterDialog(): void {
    this.dialogOpen = false;
    setTimeout(() => this.filterTrigger?.nativeElement.focus());
  }

  applyFilter(): void {
    this.accessFilterChange.emit(this.draftAccessFilter);
    this.closeFilterDialog();
  }

  @HostListener('document:keydown', ['$event'])
  handleDialogKeydown(event: KeyboardEvent): void {
    if (!this.dialogOpen) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeFilterDialog();
      return;
    }

    if (event.key !== 'Tab') return;
    const focusable = this.filterDialog?.nativeElement.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled])',
    );
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (
      event.shiftKey &&
      (document.activeElement === first ||
        document.activeElement === this.filterDialog?.nativeElement)
    ) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  updateSort(event: Event): void {
    this.sortOrderChange.emit((event.target as HTMLSelectElement).value as ReportSortOrder);
  }
}
