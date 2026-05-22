import { Component } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { switchMap } from "rxjs";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  readonly loading$ = this.authService.loading$;
  readonly error$ = this.authService.error$;

  readonly form = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required]],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  onSubmit(): void {
    if (this.form.invalid) return;

    const email = this.form.value.email ?? "";
    const password = this.form.value.password ?? "";

    this.authService
      .login({ email, password })
      .pipe(switchMap(() => this.authService.loadCurrentUser()))
      .subscribe({
        next: () => {
          const redirect = this.route.snapshot.queryParamMap.get("redirect");
          this.router.navigate([redirect || "/profile"]);
        },
      });
  }
}

