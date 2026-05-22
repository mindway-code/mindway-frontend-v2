import { Component } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { switchMap } from "rxjs";
import { AuthService } from "../../servicos/auth.service";

@Component({
  selector: 'app-register-teacher',
  standalone: false,
  templateUrl: './register-teacher.component.html',
  styleUrl: './register-teacher.component.scss'
})
export class RegisterTeacherComponent {
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
    if (this.form.invalid) return;

    const name = this.form.value.name ?? "";
    const email = this.form.value.email ?? "";
    const password = this.form.value.password ?? "";
    const confirmPassword = this.form.value.confirmPassword ?? "";

    this.authService
      .register({ name, email, password, confirmPassword, role: "professional" })
      .pipe(switchMap(() => this.authService.loadCurrentUser()))
      .subscribe({ next: () => this.router.navigate(["/profile"]) });
  }
}

