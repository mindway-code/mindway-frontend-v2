import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { MfaService } from './mfa.service';

describe('MfaService', () => {
  let service: MfaService;
  let http: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/auth/mfa`;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(MfaService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('starts and confirms a TOTP enrollment', () => {
    service.startTotpEnrollment({ currentPassword: 'password' }).subscribe((result) => {
      expect(result.enrollmentId).toBe('enrollment-id');
    });
    const start = http.expectOne(`${baseUrl}/totp/enrollments`);
    expect(start.request.method).toBe('POST');
    expect(start.request.body).toEqual({ currentPassword: 'password' });
    start.flush({
      success: true,
      data: {
        enrollmentId: 'enrollment-id',
        manualSecret: 'SECRET',
        otpauthUri: 'otpauth://totp/MINDWAY:test',
        expiresInSeconds: 600,
      },
    });

    service.confirmTotpEnrollment('enrollment-id', { code: '123456' }).subscribe((result) => {
      expect(result.recoveryCodes).toEqual(['RECOVERY-CODE']);
    });
    const confirm = http.expectOne(`${baseUrl}/totp/enrollments/enrollment-id/confirm`);
    expect(confirm.request.method).toBe('POST');
    confirm.flush({ success: true, data: { recoveryCodes: ['RECOVERY-CODE'] } });
  });

  it('regenerates recovery codes and disables TOTP', () => {
    const payload = { currentPassword: 'password', code: '123456' };
    service.regenerateRecoveryCodes(payload).subscribe();
    const regenerate = http.expectOne(`${baseUrl}/recovery-codes/regenerate`);
    expect(regenerate.request.body).toEqual(payload);
    regenerate.flush({ success: true, data: { recoveryCodes: ['NEW-CODE'] } });

    service.disableTotp(payload).subscribe();
    const disable = http.expectOne(`${baseUrl}/totp`);
    expect(disable.request.method).toBe('DELETE');
    expect(disable.request.body).toEqual(payload);
    disable.flush({ success: true, data: {} });
  });
});
