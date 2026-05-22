import { Injectable } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from "@angular/router";
import { Observable, map, take } from "rxjs";
import type { UserRole } from "../../api/interfaces/user.interface";
import { AuthService } from "../../services/auth.service";

@Injectable({ providedIn: "root" })
export class RoleGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    const allowed = (route.data?.["roles"] as UserRole[] | undefined) ?? [];
    if (allowed.length === 0) return this.authService.isAuthenticated$.pipe(take(1), map((ok) => ok || this.router.parseUrl("/login")));

    return this.authService.currentUser$.pipe(
      take(1),
      map((user) => {
        if (!user) return this.router.parseUrl("/login");
        const role = user.role ?? undefined;
        if (!role) return this.router.parseUrl("/unauthorized");
        return allowed.includes(role) ? true : this.router.parseUrl("/unauthorized");
      })
    );
  }
}


