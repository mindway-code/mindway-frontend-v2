import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize, switchMap, take } from 'rxjs';
import type { ReportsChildRecord } from '../../../../api/interfaces/reports-child.interface';
import { MfaService } from '../../../../services/mfa.service';
import { ReportsChildService } from '../../../../services/reports-child.service';

@Component({
  selector: 'app-report-validation-dialog',
  standalone: false,
  templateUrl: './report-validation-dialog.component.html',
  styleUrl: './report-validation-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportValidationDialogComponent implements OnInit, AfterViewInit {
  @Input({ required: true }) report!: ReportsChildRecord;
  @Input() returnFocus: HTMLElement | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() validated = new EventEmitter<ReportsChildRecord>();

  @ViewChild('dialog') dialog?: ElementRef<HTMLElement>;
  @ViewChild('codeInput') codeInput?: ElementRef<HTMLInputElement>;

  code = '';
  checkingMfa = true;
  mfaEnabled = false;
  submitting = false;
  error: string | null = null;
  readonly settingsReturnUrl: string;

  constructor(
    private readonly mfaService: MfaService,
    private readonly reportsService: ReportsChildService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.settingsReturnUrl = this.router.url;
  }

  ngOnInit(): void {
    this.mfaService
      .getStatus()
      .pipe(take(1))
      .subscribe({
        next: (status) => {
          this.mfaEnabled = status.enabled;
          this.checkingMfa = false;
          this.cdr.markForCheck();
          if (status.enabled) queueMicrotask(() => this.codeInput?.nativeElement.focus());
        },
        error: () => {
          this.checkingMfa = false;
          this.error = 'Não foi possível verificar a configuração de segurança. Tente novamente.';
          this.cdr.markForCheck();
        },
      });
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => this.dialog?.nativeElement.focus());
  }

  onCodeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.code = input.value.replace(/\D/g, '').slice(0, 6);
    if (input.value !== this.code) input.value = this.code;
    this.error = null;
  }

  onPaste(event: ClipboardEvent): void {
    const digits = event.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) ?? '';
    if (!digits) return;
    event.preventDefault();
    this.code = digits;
    if (this.codeInput) this.codeInput.nativeElement.value = digits;
    this.error = null;
  }

  submit(): void {
    if (this.submitting || !this.mfaEnabled) return;
    if (!/^\d{6}$/.test(this.code)) {
      this.error = 'Digite o código de seis dígitos do seu aplicativo autenticador.';
      this.codeInput?.nativeElement.focus();
      return;
    }

    this.submitting = true;
    this.error = null;
    const idempotencyKey = globalThis.crypto.randomUUID();
    this.mfaService
      .issueStepUpGrant({
        method: 'TOTP',
        code: this.code,
        action: 'report.validate',
        resourceType: 'reportRevision',
        resourceId: this.report.revision.id,
      })
      .pipe(
        switchMap(({ grant }) =>
          this.reportsService.validateReport(
            this.report.id,
            {
              revisionId: this.report.revision.id,
              expectedContentHash: this.report.revision.contentHash,
              type: 'AUTHOR_ATTESTATION',
            },
            grant,
            idempotencyKey,
          ),
        ),
        take(1),
        finalize(() => {
          this.submitting = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (report) => {
          this.submitting = false;
          this.code = '';
          this.validated.emit(report);
          this.dismiss();
        },
        error: (error: unknown) => {
          this.error = this.errorMessage(error);
          this.cdr.markForCheck();
          queueMicrotask(() => this.codeInput?.nativeElement.focus());
        },
      });
  }

  dismiss(): void {
    if (this.submitting) return;
    this.close.emit();
    queueMicrotask(() => this.returnFocus?.focus());
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.dismiss();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = this.dialog?.nativeElement.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  private errorMessage(error: unknown): string {
    const code =
      error instanceof HttpErrorResponse
        ? (error.error as { error?: { code?: string } } | null)?.error?.code
        : undefined;
    const messages: Record<string, string> = {
      MFA_CODE_INVALID: 'O código informado é inválido. Confira o aplicativo e tente novamente.',
      MFA_CODE_REUSED: 'Esse código já foi usado. Aguarde o próximo código e tente novamente.',
      MFA_RATE_LIMITED: 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.',
      MFA_PROOF_EXPIRED: 'A confirmação expirou. Informe um novo código.',
      MFA_PROOF_ALREADY_USED: 'A confirmação já foi usada. Informe um novo código.',
      MFA_PROOF_SCOPE_MISMATCH: 'A confirmação não pertence a esta revisão.',
      REPORT_CONTENT_HASH_MISMATCH:
        'O conteúdo mudou. Feche esta janela e revise o relatório novamente.',
      REPORT_REVISION_MISMATCH:
        'Uma revisão mais recente está disponível. Reabra o relatório para continuar.',
      REPORT_NOT_SUBMITTED: 'Esta revisão não está mais aguardando validação.',
      REPORT_ALREADY_VALIDATED: 'Esta revisão já foi validada.',
    };
    return code && messages[code]
      ? messages[code]
      : 'Não foi possível concluir a validação. Nenhuma alteração foi publicada.';
  }
}
