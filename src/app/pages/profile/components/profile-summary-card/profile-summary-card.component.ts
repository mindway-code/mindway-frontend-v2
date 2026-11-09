import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { UserRecord } from '../../../../api/interfaces/user.interface';

@Component({
  selector: 'app-profile-summary-card',
  standalone: false,
  templateUrl: './profile-summary-card.component.html',
  styleUrl: './profile-summary-card.component.css',
})
export class ProfileSummaryCardComponent {
  @Input() user: UserRecord | null = null;
  @Input() pushNotificationsEnabled = true;
  @Input() legalAccepted = false;
  @Input() loggingOut = false;

  @Output() edit = new EventEmitter<void>();
  @Output() changePassword = new EventEmitter<void>();
  @Output() pushNotificationsChange = new EventEmitter<boolean>();
  @Output() openLegalTerms = new EventEmitter<void>();
  @Output() logoutAccount = new EventEmitter<void>();

  get roleLabel(): string {
    const labels: Record<string, string> = {
      admin: 'Administrador',
      therapist: 'Terapeuta',
      common: 'Responsável',
      enterprise: 'Instituição',
      professional: 'Profissional',
    };
    return this.user?.role ? (labels[this.user.role] ?? 'Usuário') : 'Usuário';
  }

  get profilePhoto(): string | null {
    if (!this.user?.id || typeof localStorage === 'undefined') return null;
    return localStorage.getItem(`mindway-account-photo-${this.user.id}`);
  }

  onPushNotificationsChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.pushNotificationsChange.emit(input.checked);
  }
}
