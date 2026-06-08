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
  searchTerm = "";

  @Output() selectedChildIdChange = new EventEmitter<string>();

  get filteredChildren(): ChildRecord[] {
    const children = this.children ?? [];
    const normalizedSearch = this.searchTerm.trim().toLowerCase();

    if (!normalizedSearch) return children;

    const filtered = children.filter((child) => child.name.toLowerCase().includes(normalizedSearch));
    const selectedChild = children.find((child) => child.id === this.selectedChildId);

    if (selectedChild && !filtered.some((child) => child.id === selectedChild.id)) {
      return [selectedChild, ...filtered];
    }

    return filtered;
  }

  onSelect(value: string): void {
    this.selectedChildIdChange.emit(value);
  }

  trackById(_index: number, child: ChildRecord): string {
    return child.id;
  }
}
