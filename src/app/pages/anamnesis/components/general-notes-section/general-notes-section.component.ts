import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import type { UpdateAnamnesisGeneralNotesDTO } from "../../../../api/interfaces/anamnesis.interface";

@Component({
  selector: "app-general-notes-section",
  standalone: false,
  templateUrl: "./general-notes-section.component.html",
  styleUrls: ["./general-notes-section.component.scss"],
})
export class GeneralNotesSectionComponent implements OnChanges {
  @Input() generalNotes: string | null | undefined = "";
  @Input() saving = false;

  @Output() save = new EventEmitter<UpdateAnamnesisGeneralNotesDTO>();

  editing = false;

  readonly form = this.fb.group({
    generalNotes: ["" as string],
  });

  constructor(private readonly fb: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["generalNotes"]) {
      this.form.patchValue({ generalNotes: this.generalNotes ?? "" }, { emitEvent: false });
      if (this.editing) this.editing = false;
    }
  }

  onEdit(): void {
    this.editing = true;
    this.form.patchValue({ generalNotes: this.generalNotes ?? "" }, { emitEvent: false });
  }

  onCancel(): void {
    this.editing = false;
    this.form.patchValue({ generalNotes: this.generalNotes ?? "" }, { emitEvent: false });
  }

  onSubmit(): void {
    const value = this.form.value.generalNotes ?? "";
    const trimmed = value.trim();
    this.save.emit({ generalNotes: trimmed ? trimmed : null });
  }
}

