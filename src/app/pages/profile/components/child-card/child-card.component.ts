import { Component, Input } from "@angular/core";
import type { ChildRecord } from "../../../../api/interfaces/child.interface";

@Component({
  selector: "app-child-card",
  standalone: false,
  templateUrl: "./child-card.component.html",
  styleUrl: "./child-card.component.css",
})
export class ChildCardComponent {
  @Input() child!: ChildRecord;

  get birthDateLabel(): string {
    const raw = this.child?.birthDate;
    if (!raw) return "—";
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return String(raw);
    return date.toLocaleDateString();
  }

  get createdAtLabel(): string {
    const raw = this.child?.createdAt;
    if (!raw) return "—";
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return String(raw);
    return date.toLocaleDateString();
  }
}

