import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import type { ReportsChildRecord } from '../../../../api/interfaces/reports-child.interface';
import { ReportValidationDialogComponent } from './report-validation-dialog.component';

function report(): ReportsChildRecord {
  return {
    id: 'report-1',
    childId: 'child-1',
    userRole: 'professional',
    author: { id: 'author-1', name: 'Author', email: 'author@example.com' },
    lifecycle: {
      status: 'SUBMITTED',
      currentRevisionNumber: 2,
      publishedRevisionNumber: 1,
      hasUnpublishedChanges: true,
    },
    revision: {
      id: 'revision-2',
      revisionNumber: 2,
      status: 'SUBMITTED',
      contentHash: 'a'.repeat(64),
      title: 'Final report',
      behavior: 'Observed',
      difficulty: null,
      recommendation: 'Continue',
      submittedAt: '2026-11-17T20:00:00.000Z',
      rejectedAt: null,
      rejectionReason: null,
      createdAt: '2026-11-17T19:00:00.000Z',
      updatedAt: '2026-11-17T20:00:00.000Z',
    },
    validation: null,
    capabilities: {
      canView: true,
      canEditDraft: false,
      canSubmit: false,
      canValidate: true,
      canCreateRevision: false,
      canArchive: true,
      canRevokeValidation: false,
    },
    createdAt: '2026-11-17T19:00:00.000Z',
    updatedAt: '2026-11-17T20:00:00.000Z',
  };
}

function setup() {
  const mfa = {
    getStatus: jasmine
      .createSpy()
      .and.returnValue(of({ enabled: true, enabledAt: null, recoveryCodesRemaining: 8 })),
    issueStepUpGrant: jasmine.createSpy(),
  };
  const reports = { validateReport: jasmine.createSpy() };
  const router = { url: '/reports-child' };
  const cdr = { markForCheck: jasmine.createSpy() } as unknown as ChangeDetectorRef;
  const component = new ReportValidationDialogComponent(
    mfa as any,
    reports as any,
    router as any,
    cdr,
  );
  component.report = report();
  return { component, mfa, reports };
}

describe('ReportValidationDialogComponent', () => {
  it('loads factor status and accepts a pasted six-digit code', () => {
    const { component } = setup();
    component.ngOnInit();
    expect(component.mfaEnabled).toBeTrue();
    const preventDefault = jasmine.createSpy();
    component.onPaste({
      clipboardData: { getData: () => '12 34-56' },
      preventDefault,
    } as unknown as ClipboardEvent);
    expect(component.code).toBe('123456');
    expect(preventDefault).toHaveBeenCalled();
  });

  it('keeps the proof in the immediate request chain and prevents duplicate submissions', () => {
    const { component, mfa, reports } = setup();
    component.ngOnInit();
    const grant$ = new Subject<{ grant: string; expiresIn: number }>();
    const validation$ = new Subject<ReportsChildRecord>();
    mfa.issueStepUpGrant.and.returnValue(grant$);
    reports.validateReport.and.returnValue(validation$);
    const localStorageSpy = spyOn(localStorage, 'setItem');
    const sessionStorageSpy = spyOn(sessionStorage, 'setItem');
    const closeSpy = spyOn(component.close, 'emit');
    component.code = '123456';

    component.submit();
    component.submit();
    expect(mfa.issueStepUpGrant).toHaveBeenCalledTimes(1);
    expect(component.submitting).toBeTrue();

    grant$.next({ grant: 'opaque-proof', expiresIn: 300 });
    expect(reports.validateReport).toHaveBeenCalledOnceWith(
      'report-1',
      { revisionId: 'revision-2', expectedContentHash: 'a'.repeat(64), type: 'AUTHOR_ATTESTATION' },
      'opaque-proof',
      jasmine.any(String),
    );
    expect(localStorageSpy).not.toHaveBeenCalled();
    expect(sessionStorageSpy).not.toHaveBeenCalled();

    validation$.next({
      ...component.report,
      lifecycle: { ...component.report.lifecycle, status: 'VALIDATED' },
    });
    validation$.complete();
    expect(component.submitting).toBeFalse();
    expect(closeSpy).toHaveBeenCalled();
  });

  it('shows a focused recovery message for an invalid TOTP without retrying JWT refresh itself', () => {
    const { component, mfa, reports } = setup();
    component.ngOnInit();
    mfa.issueStepUpGrant.and.returnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 401,
            error: { error: { code: 'MFA_CODE_INVALID' } },
          }),
      ),
    );
    component.code = '123456';
    component.submit();
    expect(component.error).toContain('inválido');
    expect(reports.validateReport).not.toHaveBeenCalled();
  });

  it('restores focus when dismissed and closes with Escape', fakeAsync(() => {
    const { component } = setup();
    const focusTarget = { focus: jasmine.createSpy() } as unknown as HTMLElement;
    component.returnFocus = focusTarget;
    spyOn(component.close, 'emit');
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    component.onKeydown(event);
    tick();
    expect(component.close.emit).toHaveBeenCalled();
    expect(focusTarget.focus).toHaveBeenCalled();
  }));
});
