import { Component, EventEmitter, Input, Output } from "@angular/core";
import type { ReportsChildRecord } from "../../../../api/interfaces/reports-child.interface";

export type ReportsChildListItem = ReportsChildRecord & { canManage?: boolean };

@Component({
  selector: "app-reports-child-list",
  standalone: false,
  templateUrl: "./reports-child-list.component.html",
  styleUrls: ["./reports-child-list.component.scss"],
})
export class ReportsChildListComponent {
  @Input() reports: ReportsChildListItem[] | null = [];
  @Input() loading = false;
  @Input() selectedChildId: string | null = null;

  @Output() create = new EventEmitter<void>();
  @Output() edit = new EventEmitter<ReportsChildRecord>();
  @Output() delete = new EventEmitter<ReportsChildListItem>();

  trackById(_index: number, item: ReportsChildListItem): string {
    return item.id;
  }
}

