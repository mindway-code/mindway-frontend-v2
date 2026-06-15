import { Component } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { switchMap } from "rxjs";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-link-therapist",
  standalone: false,
  templateUrl: "./link-therapist.component.html",
  styleUrl: "./link-therapist.component.css",
})
export class LinkTherapistComponent {
  readonly loading$ = this.authService.loading$;
  readonly error$ = this.authService.error$;

  readonly form = this.fb.group({
    name: ["", [Validators.required]],
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required, Validators.minLength(6)]],
    confirmPassword: ["", [Validators.required, Validators.minLength(6)]],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  onSubmit(): void {
    if (this.form.invalid || this.passwordsDoNotMatch) {
      this.form.markAllAsTouched();
      return;
    }

    const name = this.form.value.name?.trim() ?? "";
    const email = this.form.value.email?.trim() ?? "";
    const password = this.form.value.password ?? "";
    const confirmPassword = this.form.value.confirmPassword ?? "";

    this.authService
      .register({ name, email, password, confirmPassword, role: "therapist" })
      .pipe(switchMap(() => this.authService.loadCurrentUser()))
      .subscribe({
        next: () => this.router.navigate(["/profile"]),
      });
  }

  get passwordsDoNotMatch(): boolean {
    const password = this.form.value.password ?? "";
    const confirmPassword = this.form.value.confirmPassword ?? "";
    return Boolean(password && confirmPassword && password !== confirmPassword);
  }
}
