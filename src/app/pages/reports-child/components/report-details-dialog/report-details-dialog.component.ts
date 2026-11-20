import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import {
  reportStatusLabel,
  type ReportsChildRecord,
} from '../../../../api/interfaces/reports-child.interface';

type ReportWithPermissions = ReportsChildRecord;

@Component({
  selector: 'app-report-details-dialog',
  standalone: false,
  templateUrl: './report-details-dialog.component.html',
  styleUrl: './report-details-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportDetailsDialogComponent {
  @Input({ required: true }) report!: ReportWithPermissions;
  @Input() typeLabel = 'Relatório';

  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<ReportsChildRecord>();
  @Output() delete = new EventEmitter<ReportWithPermissions>();
  @Output() submitDraft = new EventEmitter<ReportWithPermissions>();
  @Output() createRevision = new EventEmitter<ReportWithPermissions>();
  @Output() validated = new EventEmitter<ReportWithPermissions>();

  validationOpen = false;
  validationReturnFocus: HTMLElement | null = null;

  get author(): string {
    return this.report.author.name || this.report.author.email || 'Autor não identificado';
  }

  get status(): string {
    return reportStatusLabel(this.report);
  }

  print(): void {
    window.print();
  }

  openValidation(event: Event): void {
    if (!this.report.capabilities.canValidate) return;
    this.validationReturnFocus = event.currentTarget as HTMLElement;
    this.validationReturnFocus.blur();
    this.validationOpen = true;
  }

  closeValidation(): void {
    this.validationOpen = false;
  }

  onValidated(report: ReportsChildRecord): void {
    this.validated.emit(report);
  }
}
