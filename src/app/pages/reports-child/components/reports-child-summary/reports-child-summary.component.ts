import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import type { PaginationMeta } from '../../../../api/interfaces/api-response.interface';
import type { ReportsChildRecord } from '../../../../api/interfaces/reports-child.interface';

type SummaryReport = ReportsChildRecord & { canManage?: boolean };

@Component({
  selector: 'app-reports-child-summary',
  standalone: false,
  templateUrl: './reports-child-summary.component.html',
  styleUrl: './reports-child-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsChildSummaryComponent {
  @Input() reports: SummaryReport[] = [];
  @Input() pagination: PaginationMeta | null = null;

  get total(): number {
    return this.pagination?.total ?? this.reports.length;
  }

  get sharedOnPage(): number {
    return this.reports.filter((report) => !report.canManage).length;
  }

  get manageableOnPage(): number {
    return this.reports.filter((report) => report.canManage).length;
  }

  get latestDate(): string | null {
    const dates = this.reports
      .map((report) => report.createdAt)
      .filter(Boolean)
      .sort();
    return dates.at(-1) ?? null;
  }
}
