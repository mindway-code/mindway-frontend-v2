import { Component, DestroyRef, HostListener, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, switchMap, take } from 'rxjs';
import type { UpdateUserDTO } from '../../api/interfaces/user.interface';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import {
  LEGAL_CONTENT,
  LEGAL_UPDATED_AT,
  LEGAL_VERSION,
  type LegalAcceptanceRecord,
  type LegalDocumentType,
} from '../../shared/legal/legal-content';

type StoredNotificationPreferences = Record<string, boolean> & { inApp?: boolean };

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly notificationStorageKey = 'mindway-notification-preferences';
  private currentUserId: string | null = null;

  readonly user$ = this.authService.currentUser$;
  readonly userError$ = this.authService.error$;
  readonly profileSaving$ = this.userService.saving$;
  readonly profileError$ = this.userService.error$;
  readonly legalContent = LEGAL_CONTENT;
  readonly legalUpdatedAt = LEGAL_UPDATED_AT;
  readonly legalVersion = LEGAL_VERSION;
  readonly passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  });

  editMode = false;
  passwordDialogOpen = false;
  termsDialogOpen = false;
  legalDocument: LegalDocumentType = 'terms';
  legalAccepted = false;
  legalAcceptanceChecked = false;
  legalAcceptanceMessage: string | null = null;
  legalAcceptanceRecord: LegalAcceptanceRecord | null = null;
  pushNotificationsEnabled = true;
  loggingOut = false;
  flashMessage: string | null = null;
  passwordMessage: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.loadPushPreference();
    this.user$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((user) => {
      this.currentUserId = user?.id ?? null;
      if (user?.id) this.loadLegalAcceptance(user.id);
    });
  }

  startEdit(): void {
    this.editMode = true;
    this.flashMessage = null;
  }

  cancelEdit(): void {
    this.editMode = false;
  }

  saveProfile(payload: UpdateUserDTO): void {
    this.flashMessage = null;

    this.userService
      .updateMe(payload)
      .pipe(
        switchMap(() => this.authService.loadCurrentUser()),
        take(1),
      )
      .subscribe({
        next: () => {
          this.editMode = false;
          this.flashMessage = 'Perfil atualizado.';
        },
        error: () => {
          // UserService exposes a user-friendly message.
        },
      });
  }

  openPasswordDialog(): void {
    this.passwordForm.reset();
    this.passwordMessage = null;
    this.passwordDialogOpen = true;
  }

  closePasswordDialog(): void {
    this.passwordDialogOpen = false;
    this.passwordMessage = null;
    this.passwordForm.reset();
  }

  @HostListener('document:keydown.escape')
  closePasswordDialogOnEscape(): void {
    if (this.termsDialogOpen) {
      this.closeTermsDialog();
      return;
    }
    if (this.passwordDialogOpen) this.closePasswordDialog();
  }

  openTermsDialog(): void {
    this.legalDocument = 'terms';
    this.legalAcceptanceChecked = false;
    this.legalAcceptanceMessage = null;
    this.termsDialogOpen = true;
  }

  closeTermsDialog(): void {
    this.termsDialogOpen = false;
    this.legalAcceptanceChecked = false;
    this.legalAcceptanceMessage = null;
  }

  selectLegalDocument(document: LegalDocumentType): void {
    this.legalDocument = document;
  }

  acceptLegalDocuments(): void {
    if (!this.legalAcceptanceChecked) {
      this.legalAcceptanceMessage =
        'Confirme que leu e aceita os Termos de Uso e a Política de Privacidade.';
      return;
    }
    if (!this.currentUserId) {
      this.legalAcceptanceMessage = 'Não foi possível identificar sua conta. Tente novamente.';
      return;
    }

    const acceptedAt = new Date().toISOString();
    const record: LegalAcceptanceRecord = {
      termsAcceptedAt: acceptedAt,
      privacyAcceptedAt: acceptedAt,
      termsVersion: this.legalVersion,
      privacyVersion: this.legalVersion,
    };

    try {
      localStorage.setItem(
        `mindway-legal-acceptance-${this.currentUserId}`,
        JSON.stringify(record),
      );
      this.legalAcceptanceRecord = record;
      this.legalAccepted = true;
      this.closeTermsDialog();
      this.flashMessage = 'Termos de Uso e Política de Privacidade aceitos.';
    } catch {
      this.legalAcceptanceMessage =
        'Não foi possível registrar o aceite neste navegador. Tente novamente.';
    }
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.getRawValue();
    if (newPassword !== confirmPassword) {
      this.passwordMessage = 'A nova senha e a confirmação estão diferentes.';
      return;
    }

    this.passwordMessage = null;
    this.userService
      .changePassword(currentPassword ?? '', newPassword ?? '')
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.closePasswordDialog();
          this.flashMessage = 'Senha alterada com sucesso.';
        },
        error: () => {
          this.passwordMessage =
            'A senha atual não confere ou não foi possível concluir. Tente novamente.';
        },
      });
  }

  setPushNotifications(enabled: boolean): void {
    this.pushNotificationsEnabled = enabled;

    try {
      const saved = localStorage.getItem(this.notificationStorageKey);
      const preferences = saved
        ? (JSON.parse(saved) as StoredNotificationPreferences)
        : ({} as StoredNotificationPreferences);

      localStorage.setItem(
        this.notificationStorageKey,
        JSON.stringify({ ...preferences, inApp: enabled }),
      );
      this.flashMessage = enabled
        ? 'Notificações push ativadas neste navegador.'
        : 'Notificações push desativadas neste navegador.';
    } catch {
      this.flashMessage = 'Não foi possível salvar a preferência de notificações.';
    }
  }

  logout(): void {
    if (this.loggingOut) return;

    this.loggingOut = true;
    this.authService
      .logout()
      .pipe(
        take(1),
        finalize(() => (this.loggingOut = false)),
      )
      .subscribe(() => void this.router.navigate(['/login']));
  }

  private loadPushPreference(): void {
    try {
      const saved = localStorage.getItem(this.notificationStorageKey);
      if (!saved) return;

      const preferences = JSON.parse(saved) as StoredNotificationPreferences;
      this.pushNotificationsEnabled = preferences.inApp ?? true;
    } catch {
      this.pushNotificationsEnabled = true;
    }
  }

  private loadLegalAcceptance(userId: string): void {
    try {
      const saved = localStorage.getItem(`mindway-legal-acceptance-${userId}`);
      const record = saved ? (JSON.parse(saved) as LegalAcceptanceRecord) : null;
      const isCurrentVersion =
        record?.termsVersion === this.legalVersion && record?.privacyVersion === this.legalVersion;

      this.legalAcceptanceRecord = isCurrentVersion ? record : null;
      this.legalAccepted = Boolean(this.legalAcceptanceRecord);
    } catch {
      this.legalAcceptanceRecord = null;
      this.legalAccepted = false;
    }
  }
}
