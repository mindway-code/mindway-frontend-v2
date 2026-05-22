import { Component, EventEmitter, Input, Output } from "@angular/core";
import type { ChildRecord, CreateChildDTO } from "../../../../api/interfaces/child.interface";

@Component({
  selector: "app-children-section",
  standalone: false,
  templateUrl: "./children-section.component.html",
  styleUrl: "./children-section.component.css",
})
export class ChildrenSectionComponent {
  @Input() children: ChildRecord[] = [];
  @Input() loading = false;
  @Input() saving = false;
  @Input() error: string | null = null;

  @Input() showCreate = false;

  @Output() toggleCreate = new EventEmitter<void>();
  @Output() createChild = new EventEmitter<CreateChildDTO>();
  @Output() closeCreate = new EventEmitter<void>();
}

