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
    // { label: "Perfil", route: "/profile", icon: "bi-person" },
    { label: "Anamnese", route: "/anamnesis", icon: "bi-journal-text" },
    { label: "Criança", route: "/child-profile", icon: "bi-person" },
    { label: "Relatórios", route: "/reports-child", icon: "bi-clipboard-data" },
    { label: "Escola", route: "#", icon: "bi-building" },
    { label: "Professores", route: "#", icon: "bi-person-workspace" },
    { label: "Mensagens", route: "#", icon: "bi-clipboard-data" },
    { label: "Configurações", route: "#", icon: "bi-gear" },
  ];

  isDesktopSidebarExpanded = true;
  isMobileSidebarOpen = false;
  private viewportWidth = this.getViewportWidth();

  constructor(private readonly authService: AuthService) {}

  get isMobileViewport(): boolean {
    return this.viewportWidth <= 900;
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
