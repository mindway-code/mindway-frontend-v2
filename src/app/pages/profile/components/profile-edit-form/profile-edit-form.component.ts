import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import type { UpdateUserDTO, UserRecord } from "../../../../api/interfaces/user.interface";

@Component({
  selector: "app-profile-edit-form",
  standalone: false,
  templateUrl: "./profile-edit-form.component.html",
  styleUrl: "./profile-edit-form.component.css",
})
export class ProfileEditFormComponent implements OnChanges {
  @Input() user: UserRecord | null = null;
  @Input() saving = false;
  @Input() error: string | null = null;

  @Output() save = new EventEmitter<UpdateUserDTO>();
  @Output() cancel = new EventEmitter<void>();

  readonly form = this.fb.group({
    name: ["", [Validators.required, Validators.minLength(2)]],
    email: ["", [Validators.required, Validators.email]],
  });

  constructor(private readonly fb: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["user"]) {
      const name = this.user?.name ?? "";
      const email = this.user?.email ?? "";
      this.form.reset({ name, email }, { emitEvent: false });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, email } = this.form.getRawValue();
    this.save.emit({ name: name?.trim() || undefined, email: email?.trim() || undefined });
  }
}

