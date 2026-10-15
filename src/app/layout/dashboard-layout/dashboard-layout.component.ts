import { Component, HostListener } from "@angular/core";
import { AuthService } from "../../services/auth.service";

interface DashboardNavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: false,
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.css'
})
export class DashboardLayoutComponent {
  readonly currentUser$ = this.authService.currentUser$;
  readonly navItems: DashboardNavItem[] = [
    { label: "Início", route: "/dashboard", icon: "bi-house-door" },
    { label: "Anamnese", route: "/anamnesis", icon: "bi-journal-text" },
    { label: "Crianças", route: "/child-profile", icon: "bi-people" },
    { label: "Relatórios", route: "/reports-child", icon: "bi-clipboard-data" },
    { label: "Mensagens", route: "/messages", icon: "bi-chat" },
    { label: "Configurações", route: "/settings", icon: "bi-gear" },
  ];

  isDesktopSidebarExpanded = true;
  isMobileSidebarOpen = false;
  private viewportWidth = this.getViewportWidth();

  constructor(private readonly authService: AuthService) {}

  get isMobileViewport(): boolean {
    return this.viewportWidth <= 900;
  }

  getProfilePhoto(userId: string): string | null {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(`mindway-account-photo-${userId}`);
  }
  toggleSidebar(): void {
    if (this.isMobileViewport) {
      this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
      return;
    }

    this.isDesktopSidebarExpanded = !this.isDesktopSidebarExpanded;
  }

  closeMobileSidebar(): void {
    if (this.isMobileViewport) {
      this.isMobileSidebarOpen = false;
    }
  }

  @HostListener("window:resize")
  onResize(): void {
    this.viewportWidth = this.getViewportWidth();

    if (!this.isMobileViewport) {
      this.isMobileSidebarOpen = false;
    }
  }

  private getViewportWidth(): number {
    return typeof window !== "undefined" ? window.innerWidth : 1280;
  }
}
