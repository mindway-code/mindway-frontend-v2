import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "app-anamnesis-section-shell",
  standalone: false,
  templateUrl: "./anamnesis-section-shell.component.html",
  styleUrls: ["./anamnesis-section-shell.component.scss"],
})
export class AnamnesisSectionShellComponent {
  @Input() title = "";
  @Input() subtitle = "";
  @Input() exists = false;
  @Input() editing = false;
  @Input() saving = false;
  @Input() canDelete = true;

  @Output() edit = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
}

