import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import type {
  CreateReportsChildDTO,
  ReportsChildRecord,
  UpdateReportsChildDTO,
} from "../../../../api/interfaces/reports-child.interface";

@Component({
  selector: "app-reports-child-form",
  standalone: false,
  templateUrl: "./reports-child-form.component.html",
  styleUrls: ["./reports-child-form.component.scss"],
})
export class ReportsChildFormComponent implements OnChanges {
  @Input() report: ReportsChildRecord | null = null;
  @Input() saving = false;
  @Input() mode: "create" | "edit" = "create";

  @Output() submitReport = new EventEmitter<CreateReportsChildDTO | UpdateReportsChildDTO>();
  @Output() cancel = new EventEmitter<void>();

  readonly form = this.fb.group({
    title: ["", [Validators.required]],
    behavior: [""],
    difficulty: [""],
    recommendation: [""],
  });

  constructor(private readonly fb: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["report"] || changes["mode"]) {
      const r = this.report;
      this.form.reset({
        title: r?.title ?? "",
        behavior: r?.behavior ?? "",
        difficulty: r?.difficulty ?? "",
        recommendation: r?.recommendation ?? "",
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const title = (value.title ?? "").trim();

    if (this.mode === "create") {
      const payload: CreateReportsChildDTO = {
        title,
        behavior: value.behavior?.trim() ? value.behavior.trim() : null,
        difficulty: value.difficulty?.trim() ? value.difficulty.trim() : null,
        recommendation: value.recommendation?.trim() ? value.recommendation.trim() : null,
      };
      this.submitReport.emit(payload);
      return;
    }

    const payload: UpdateReportsChildDTO = {
      ...(title ? { title } : {}),
      behavior: value.behavior?.trim() ? value.behavior.trim() : null,
      difficulty: value.difficulty?.trim() ? value.difficulty.trim() : null,
      recommendation: value.recommendation?.trim() ? value.recommendation.trim() : null,
    };

    this.submitReport.emit(payload);
  }
}

