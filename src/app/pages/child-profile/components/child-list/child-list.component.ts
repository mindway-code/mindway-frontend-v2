import { Component, EventEmitter, Input, Output } from "@angular/core";
import type { ChildRecord } from "../../../../api/interfaces/child.interface";

@Component({
  selector: "app-child-list",
  standalone: false,
  templateUrl: "./child-list.component.html",
  styleUrl: "./child-list.component.scss",
})
export class ChildListComponent {
  @Input() children: ChildRecord[] | null = [];
  @Input() selectedChildId: string | null = null;
  searchTerm = "";

  @Output() selectChild = new EventEmitter<ChildRecord | null>();

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

  onSelectById(childId: string): void {
    const normalized = childId?.trim() ?? "";
    if (!normalized) {
      this.selectChild.emit(null);
      return;
    }

    const match = (this.children ?? []).find((child) => child.id === normalized) ?? null;
    this.selectChild.emit(match);
  }

  trackById(_index: number, child: ChildRecord): string {
    return child.id;
  }
}
