import { Component, EventEmitter, Input, Output } from "@angular/core";
import type { UserRecord } from "../../../../api/interfaces/user.interface";

@Component({
  selector: "app-profile-summary-card",
  standalone: false,
  templateUrl: "./profile-summary-card.component.html",
  styleUrl: "./profile-summary-card.component.css",
})
export class ProfileSummaryCardComponent {
  @Input() user: UserRecord | null = null;
  @Input() childrenCount = 0;
  @Output() edit = new EventEmitter<void>();

  get roleLabel(): string {
    const labels: Record<string, string> = {
      admin: "Administrador",
      therapist: "Terapeuta",
      common: "Responsável",
      enterprise: "Instituição",
      professional: "Profissional",
    };
    return this.user?.role ? labels[this.user.role] ?? "Usuário" : "Usuário";
  }

  get memberSince(): string {
    if (!this.user?.createdAt) return "—";
    const date = new Date(this.user.createdAt);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" }).replace(".", "");
  }

  get profilePhoto(): string | null {
    if (!this.user?.id || typeof localStorage === "undefined") return null;
    return localStorage.getItem(`mindway-account-photo-${this.user.id}`);
  }
}

