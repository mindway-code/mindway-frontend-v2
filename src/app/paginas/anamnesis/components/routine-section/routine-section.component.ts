import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import type { AnamnesisRoutineRecord, UpsertAnamnesisRoutineDTO } from "../../../../api/interfaces/anamnesis.interface";

@Component({
  selector: "app-routine-section",
  standalone: false,
  templateUrl: "./routine-section.component.html",
  styleUrls: ["./routine-section.component.scss"],
})
export class RoutineSectionComponent implements OnChanges {
  @Input() data: AnamnesisRoutineRecord | null | undefined = null;
  @Input() saving = false;

  @Output() save = new EventEmitter<UpsertAnamnesisRoutineDTO>();
  @Output() delete = new EventEmitter<void>();

  editing = false;

  readonly form = this.fb.group({
    wakesUpAt: ["" as string],
    therapies: ["" as string],
    schoolPeriod: ["" as string],
    extraActivity: ["" as string],
    sleepsAt: ["" as string],
    routineObservation: ["" as string],
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
    const payload: UpsertAnamnesisRoutineDTO = {
      wakesUpAt: this.toNullableString(value.wakesUpAt),
      therapies: this.toNullableString(value.therapies),
      schoolPeriod: this.toNullableString(value.schoolPeriod),
      extraActivity: this.toNullableString(value.extraActivity),
      sleepsAt: this.toNullableString(value.sleepsAt),
      routineObservation: this.toNullableString(value.routineObservation),
    };

    this.save.emit(payload);
  }

  private patchFormFromData(): void {
    this.form.patchValue(
      {
        wakesUpAt: this.data?.wakesUpAt ?? "",
        therapies: this.data?.therapies ?? "",
        schoolPeriod: this.data?.schoolPeriod ?? "",
        extraActivity: this.data?.extraActivity ?? "",
        sleepsAt: this.data?.sleepsAt ?? "",
        routineObservation: this.data?.routineObservation ?? "",
      },
      { emitEvent: false }
    );
  }

  private toNullableString(value: string | null | undefined): string | null {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  }
}

