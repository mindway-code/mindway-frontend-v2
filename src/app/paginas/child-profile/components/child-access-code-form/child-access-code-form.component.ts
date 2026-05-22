import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import type { CreateAssociationChildDTO } from "../../../../api/interfaces/association-child.interface";

@Component({
  selector: "app-child-access-code-form",
  standalone: false,
  templateUrl: "./child-access-code-form.component.html",
  styleUrl: "./child-access-code-form.component.scss",
})
export class ChildAccessCodeFormComponent {
  @Input() loading = false;
  @Input() error: string | null = null;

  @Output() associate = new EventEmitter<CreateAssociationChildDTO>();

  readonly form = this.fb.group({
    accessCode: ["", [Validators.required, Validators.minLength(6), Validators.maxLength(10)]],
  });

  constructor(private readonly fb: FormBuilder) {}

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const accessCode = this.form.getRawValue().accessCode?.trim() ?? "";
    this.associate.emit({ accessCode });
  }

  reset(): void {
    this.form.reset({ accessCode: "" });
  }
}

