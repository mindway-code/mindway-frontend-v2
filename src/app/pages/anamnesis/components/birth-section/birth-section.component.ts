import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from "@angular/core";
import { FormBuilder } from "@angular/forms";

import type {
  AnamnesisBirthRecord,
  UpsertAnamnesisBirthDTO,
} from "../../../../api/interfaces/anamnesis.interface";

@Component({
  selector: "app-birth-section",
  standalone: false,
  templateUrl: "./birth-section.component.html",
  styleUrls: ["./birth-section.component.scss"],
})
export class BirthSectionComponent implements OnChanges {
  @Input() data: AnamnesisBirthRecord | null | undefined = null;

  @Input() saving = false;

  @Output() save = new EventEmitter<UpsertAnamnesisBirthDTO>();

  @Output() delete = new EventEmitter<void>();

  editing = false;

  readonly form = this.fb.group({
    gestationalWeeks: [null as number | null],
    birthType: ["" as string],
    birthWeightGrams: [null as number | null],
    birthHeightCentimeters: [null as number | null],
    apgarOneMinute: [null as number | null],
    apgarFiveMinutes: [null as number | null],
    birthComplication: ["" as string],
    hospitalizationDays: [null as number | null],
  });

  constructor(private readonly fb: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes["data"]) {
      return;
    }

    this.patchFormFromData();

    if (this.data && !this.hasFilledData()) {
      this.editing = true;
      return;
    }

    if (this.editing && !this.saving) {
      this.editing = false;
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
    if (this.saving) {
      return;
    }

    const value = this.form.getRawValue();

    const payload: UpsertAnamnesisBirthDTO = {
      gestationalWeeks: value.gestationalWeeks ?? null,
      birthType: this.toNullableString(value.birthType),
      birthWeightGrams: value.birthWeightGrams ?? null,
      birthHeightCentimeters: value.birthHeightCentimeters ?? null,
      apgarOneMinute: value.apgarOneMinute ?? null,
      apgarFiveMinutes: value.apgarFiveMinutes ?? null,
      birthComplication: this.toNullableString(
        value.birthComplication
      ),
      hospitalizationDays: value.hospitalizationDays ?? null,
    };

    this.save.emit(payload);
  }

  private hasFilledData(): boolean {
    if (!this.data) {
      return false;
    }

    return (
      this.data.gestationalWeeks !== null &&
      this.data.gestationalWeeks !== undefined
    ) ||
      Boolean(this.data.birthType?.trim()) ||
      (
        this.data.birthWeightGrams !== null &&
        this.data.birthWeightGrams !== undefined
      ) ||
      (
        this.data.birthHeightCentimeters !== null &&
        this.data.birthHeightCentimeters !== undefined
      ) ||
      (
        this.data.apgarOneMinute !== null &&
        this.data.apgarOneMinute !== undefined
      ) ||
      (
        this.data.apgarFiveMinutes !== null &&
        this.data.apgarFiveMinutes !== undefined
      ) ||
      Boolean(this.data.birthComplication?.trim()) ||
      (
        this.data.hospitalizationDays !== null &&
        this.data.hospitalizationDays !== undefined
      );
  }

  private patchFormFromData(): void {
    this.form.patchValue(
      {
        gestationalWeeks:
          this.data?.gestationalWeeks ?? null,

        birthType:
          this.data?.birthType ?? "",

        birthWeightGrams:
          this.data?.birthWeightGrams ?? null,

        birthHeightCentimeters:
          this.data?.birthHeightCentimeters ?? null,

        apgarOneMinute:
          this.data?.apgarOneMinute ?? null,

        apgarFiveMinutes:
          this.data?.apgarFiveMinutes ?? null,

        birthComplication:
          this.data?.birthComplication ?? "",

        hospitalizationDays:
          this.data?.hospitalizationDays ?? null,
      },
      {
        emitEvent: false,
      }
    );
  }

  private toNullableString(
    value: string | null | undefined
  ): string | null {
    const trimmed = value?.trim();

    return trimmed ? trimmed : null;
  }
}