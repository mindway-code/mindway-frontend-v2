import { Component, EventEmitter, Input, Output } from "@angular/core";
import type { ChildRecord } from "../../../../api/interfaces/child.interface";

@Component({
  selector: "app-reports-child-selector",
  standalone: false,
  templateUrl: "./reports-child-selector.component.html",
  styleUrls: ["./reports-child-selector.component.scss"],
})
export class ReportsChildSelectorComponent {
  @Input() children: ChildRecord[] | null = [];
  @Input() selectedChildId: string | null = null;
  @Input() loading = false;

  @Output() selectedChildIdChange = new EventEmitter<string>();

  onChange(next: string): void {
    const normalized = next?.trim() ?? "";
    if (normalized) this.selectedChildIdChange.emit(normalized);
  }

  trackById(_index: number, item: ChildRecord): string {
    return item.id;
  }
}

