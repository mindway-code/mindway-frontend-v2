import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import type {
  AnamnesisLanguageCommunicationRecord,
  UpsertAnamnesisLanguageCommunicationDTO,
} from "../../../../api/interfaces/anamnesis.interface";

@Component({
  selector: "app-language-communication-section",
  standalone: false,
  templateUrl: "./language-communication-section.component.html",
  styleUrls: ["./language-communication-section.component.scss"],
})
export class LanguageCommunicationSectionComponent implements OnChanges {
  @Input() data: AnamnesisLanguageCommunicationRecord | null | undefined = null;
  @Input() saving = false;

  @Output() save = new EventEmitter<UpsertAnamnesisLanguageCommunicationDTO>();
  @Output() delete = new EventEmitter<void>();

  editing = false;

  readonly form = this.fb.group({
    firstWordsAgeMonths: [null as number | null],
    fullSentencesAgeMonths: [null as number | null],
    comprehension: ["" as string],
    currentCommunication: ["" as string],
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
    const payload: UpsertAnamnesisLanguageCommunicationDTO = {
      firstWordsAgeMonths: value.firstWordsAgeMonths ?? null,
      fullSentencesAgeMonths: value.fullSentencesAgeMonths ?? null,
      comprehension: this.toNullableString(value.comprehension),
      currentCommunication: this.toNullableString(value.currentCommunication),
    };

    this.save.emit(payload);
  }

  private patchFormFromData(): void {
    this.form.patchValue(
      {
        firstWordsAgeMonths: this.data?.firstWordsAgeMonths ?? null,
        fullSentencesAgeMonths: this.data?.fullSentencesAgeMonths ?? null,
        comprehension: this.data?.comprehension ?? "",
        currentCommunication: this.data?.currentCommunication ?? "",
      },
      { emitEvent: false }
    );
  }

  private toNullableString(value: string | null | undefined): string | null {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  }
}

