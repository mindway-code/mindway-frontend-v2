import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import type {
  AnamnesisBehaviorRecord,
  UpsertAnamnesisBehaviorDTO,
} from "../../../../api/interfaces/anamnesis.interface";

@Component({
  selector: "app-behavior-section",
  standalone: false,
  templateUrl: "./behavior-section.component.html",
  styleUrls: ["./behavior-section.component.scss"],
})
export class BehaviorSectionComponent implements OnChanges {
  @Input() data: AnamnesisBehaviorRecord | null | undefined = null;
  @Input() saving = false;

  @Output() save = new EventEmitter<UpsertAnamnesisBehaviorDTO>();
  @Output() delete = new EventEmitter<void>();

  editing = false;

  readonly form = this.fb.group({
    concentrationDifficulty: ["" as string],
    interaction: ["" as string],
    activityPreference: ["" as string],
    anxiety: ["" as string],
    hyperactivity: ["" as string],
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
    const payload: UpsertAnamnesisBehaviorDTO = {
      concentrationDifficulty: this.toNullableString(value.concentrationDifficulty),
      interaction: this.toNullableString(value.interaction),
      activityPreference: this.toNullableString(value.activityPreference),
      anxiety: this.toNullableString(value.anxiety),
      hyperactivity: this.toNullableString(value.hyperactivity),
    };

    this.save.emit(payload);
  }

  private patchFormFromData(): void {
    this.form.patchValue(
      {
        concentrationDifficulty: this.data?.concentrationDifficulty ?? "",
        interaction: this.data?.interaction ?? "",
        activityPreference: this.data?.activityPreference ?? "",
        anxiety: this.data?.anxiety ?? "",
        hyperactivity: this.data?.hyperactivity ?? "",
      },
      { emitEvent: false }
    );
  }

  private toNullableString(value: string | null | undefined): string | null {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  }
}

