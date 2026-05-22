import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import type {
  AnamnesisMotorDevelopmentRecord,
  UpsertAnamnesisMotorDevelopmentDTO,
} from "../../../../api/interfaces/anamnesis.interface";

@Component({
  selector: "app-motor-development-section",
  standalone: false,
  templateUrl: "./motor-development-section.component.html",
  styleUrls: ["./motor-development-section.component.scss"],
})
export class MotorDevelopmentSectionComponent implements OnChanges {
  @Input() data: AnamnesisMotorDevelopmentRecord | null | undefined = null;
  @Input() saving = false;

  @Output() save = new EventEmitter<UpsertAnamnesisMotorDevelopmentDTO>();
  @Output() delete = new EventEmitter<void>();

  editing = false;

  readonly form = this.fb.group({
    neckControlAgeMonths: [null as number | null],
    sittingAgeMonths: [null as number | null],
    crawlingAgeMonths: [null as number | null],
    firstStepsAgeMonths: [null as number | null],
    fineCoordination: ["" as string],
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
    const payload: UpsertAnamnesisMotorDevelopmentDTO = {
      neckControlAgeMonths: value.neckControlAgeMonths ?? null,
      sittingAgeMonths: value.sittingAgeMonths ?? null,
      crawlingAgeMonths: value.crawlingAgeMonths ?? null,
      firstStepsAgeMonths: value.firstStepsAgeMonths ?? null,
      fineCoordination: this.toNullableString(value.fineCoordination),
    };

    this.save.emit(payload);
  }

  private patchFormFromData(): void {
    this.form.patchValue(
      {
        neckControlAgeMonths: this.data?.neckControlAgeMonths ?? null,
        sittingAgeMonths: this.data?.sittingAgeMonths ?? null,
        crawlingAgeMonths: this.data?.crawlingAgeMonths ?? null,
        firstStepsAgeMonths: this.data?.firstStepsAgeMonths ?? null,
        fineCoordination: this.data?.fineCoordination ?? "",
      },
      { emitEvent: false }
    );
  }

  private toNullableString(value: string | null | undefined): string | null {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  }
}

