import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import type { ReportsChildRecord } from '../../../../api/interfaces/reports-child.interface';

type ReportWithPermissions = ReportsChildRecord & { canManage?: boolean };

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

  get author(): string {
    return this.report.user?.name || this.report.user?.email || 'Autor não identificado';
  }

  print(): void {
    window.print();
  }
}
