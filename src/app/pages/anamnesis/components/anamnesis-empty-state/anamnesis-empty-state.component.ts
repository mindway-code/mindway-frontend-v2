import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "app-anamnesis-empty-state",
  standalone: false,
  templateUrl: "./anamnesis-empty-state.component.html",
  styleUrls: ["./anamnesis-empty-state.component.scss"],
})
export class AnamnesisEmptyStateComponent {
  @Input() selectedChildId: string | null = null;
  @Input() saving = false;

  @Output() createAnamnesis = new EventEmitter<void>();
}

