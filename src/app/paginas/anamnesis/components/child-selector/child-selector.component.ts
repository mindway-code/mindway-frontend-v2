import { Component, EventEmitter, Input, Output } from "@angular/core";
import type { ChildRecord } from "../../../../api/interfaces/child.interface";

@Component({
  selector: "app-child-selector",
  standalone: false,
  templateUrl: "./child-selector.component.html",
  styleUrls: ["./child-selector.component.scss"],
})
export class ChildSelectorComponent {
  @Input() children: ChildRecord[] | null = [];
  @Input() selectedChildId: string | null = null;
  @Input() loading = false;

  @Output() selectedChildIdChange = new EventEmitter<string>();

  onSelect(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedChildIdChange.emit(value);
  }
}

