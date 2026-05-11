import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import type { CreateChildDTO } from "../../../../api/interfaces/child.interface";

@Component({
  selector: "app-child-create-form",
  standalone: false,
  templateUrl: "./child-create-form.component.html",
  styleUrl: "./child-create-form.component.css",
})
export class ChildCreateFormComponent {
  @Input() saving = false;
  @Input() error: string | null = null;

  @Output() create = new EventEmitter<CreateChildDTO>();
  @Output() cancel = new EventEmitter<void>();

  readonly form = this.fb.group({
    name: ["", [Validators.required, Validators.minLength(2)]],
    age: [null as number | null, [Validators.required, Validators.min(0)]],
    birthDate: ["", [Validators.required]],
    observation: [""],
  });

  constructor(private readonly fb: FormBuilder) {}

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: CreateChildDTO = {
      name: raw.name?.trim() ?? "",
      age: Number(raw.age ?? 0),
      birthDate: raw.birthDate ?? "",
      observation: raw.observation?.trim() ? raw.observation.trim() : null,
    };

    this.create.emit(payload);
  }

  reset(): void {
    this.form.reset({ name: "", age: null, birthDate: "", observation: "" });
  }
}

