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

  @Output() selectChild = new EventEmitter<ChildRecord>();

  trackById(_index: number, child: ChildRecord): string {
    return child.id;
  }
}

