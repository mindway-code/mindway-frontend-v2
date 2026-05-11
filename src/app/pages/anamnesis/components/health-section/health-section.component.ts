import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import type { AnamnesisHealthRecord, UpsertAnamnesisHealthDTO } from "../../../../api/interfaces/anamnesis.interface";

@Component({
  selector: "app-health-section",
  standalone: false,
  templateUrl: "./health-section.component.html",
  styleUrls: ["./health-section.component.scss"],
})
export class HealthSectionComponent implements OnChanges {
  @Input() data: AnamnesisHealthRecord | null | undefined = null;
  @Input() saving = false;

  @Output() save = new EventEmitter<UpsertAnamnesisHealthDTO>();
  @Output() delete = new EventEmitter<void>();

  editing = false;

  readonly form = this.fb.group({
    diagnosis: ["" as string],
    medication: ["" as string],
    allergies: ["" as string],
  });

  constructor(private readonly fb: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["data"]) {
      this.patchFormFromData();
      if (this.editing) this.editing = false;
    }
  }

  onEdit(): void {
    this.editing = true;
    this.patchFormFromData();
  }

  onCancel(): void {
    this.editing = false;
    this.patchFormFromData();
  }

  onSubmit(): void {
    const value = this.form.value;
    const payload: UpsertAnamnesisHealthDTO = {
      diagnosis: this.toNullableString(value.diagnosis),
      medication: this.toNullableString(value.medication),
      allergies: this.toNullableString(value.allergies),
    };

    this.save.emit(payload);
  }

  private patchFormFromData(): void {
    this.form.patchValue(
      {
        diagnosis: this.data?.diagnosis ?? "",
        medication: this.data?.medication ?? "",
        allergies: this.data?.allergies ?? "",
      },
      { emitEvent: false }
    );
  }

  private toNullableString(value: string | null | undefined): string | null {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  }
}

