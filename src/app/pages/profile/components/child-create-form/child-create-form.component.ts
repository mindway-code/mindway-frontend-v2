import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { Subscription } from "rxjs";
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
    age: [null as number | null],
    birthDate: ["", [Validators.required]],
    observation: [""],
  });

  private readonly birthDateSubscription: Subscription;

  constructor(private readonly fb: FormBuilder) {
    this.birthDateSubscription = this.form.controls.birthDate.valueChanges.subscribe((birthDate) => {
      this.form.controls.age.setValue(this.calculateAge(birthDate), { emitEvent: false });
    });
  }

  ngOnDestroy(): void {
    this.birthDateSubscription.unsubscribe();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const calculatedAge = this.calculateAge(raw.birthDate);
    if (calculatedAge === null) {
      this.form.controls.birthDate.setErrors({ invalidDate: true });
      this.form.controls.birthDate.markAsTouched();
      return;
    }

    const payload: CreateChildDTO = {
      name: raw.name?.trim() ?? "",
      age: calculatedAge,
      birthDate: raw.birthDate ?? "",
      observation: raw.observation?.trim() ? raw.observation.trim() : null,
    };

    this.create.emit(payload);
  }

  reset(): void {
    this.form.reset({ name: "", age: null, birthDate: "", observation: "" });
  }

  private calculateAge(birthDate: string | null | undefined): number | null {
    if (!birthDate) return null;

    const birth = new Date(`${birthDate}T00:00:00`);
    if (Number.isNaN(birth.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const birthdayThisYear = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());

    if (today < birthdayThisYear) {
      age -= 1;
    }

    return age >= 0 ? age : null;
  }
}
