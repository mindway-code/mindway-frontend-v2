import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  readonly currentUser$ = this.authService.currentUser$;
  isMenuOpen = false;

  constructor(private readonly router: Router, private readonly authService: AuthService) {}

  get showProfileHeader(): boolean {
    return this.router.url.split("?")[0].replace(/\/+$/, "") === "/profile";
  }

  getProfilePhoto(userId: string): string | null {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(`mindway-account-photo-${userId}`);
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }
}
