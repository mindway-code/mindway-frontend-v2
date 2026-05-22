import { Component, EventEmitter, Input, Output } from "@angular/core";
import type { ReportsChildRecord } from "../../../../api/interfaces/reports-child.interface";

@Component({
  selector: "app-reports-child-card",
  standalone: false,
  templateUrl: "./reports-child-card.component.html",
  styleUrls: ["./reports-child-card.component.scss"],
})
export class ReportsChildCardComponent {
  @Input({ required: true }) report!: ReportsChildRecord;
  @Input() canManage = false;

  @Output() edit = new EventEmitter<ReportsChildRecord>();
  @Output() delete = new EventEmitter<ReportsChildRecord>();
}

