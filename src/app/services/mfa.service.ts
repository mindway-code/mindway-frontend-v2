import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import type { SuccessResponse } from '../api/interfaces/api-response.interface';
import type {
  ConfirmTotpEnrollmentRequest,
  MfaProtectedActionRequest,
  MfaStatus,
  RecoveryCodesResponse,
  StartTotpEnrollmentRequest,
  StartTotpEnrollmentResponse,
  StepUpGrantRequest,
  StepUpGrantResponse,
} from '../api/interfaces/mfa.interface';

@Injectable({ providedIn: 'root' })
export class MfaService {
  private readonly baseUrl = `${environment.apiUrl}/auth/mfa`;

  constructor(private readonly http: HttpClient) {}

  getStatus(): Observable<MfaStatus> {
    return this.http
      .get<SuccessResponse<MfaStatus>>(this.baseUrl)
      .pipe(map((response) => response.data));
  }

  startTotpEnrollment(
    payload: StartTotpEnrollmentRequest,
  ): Observable<StartTotpEnrollmentResponse> {
    return this.http
      .post<SuccessResponse<StartTotpEnrollmentResponse>>(
        `${this.baseUrl}/totp/enrollments`,
        payload,
      )
      .pipe(map((response) => response.data));
  }

  confirmTotpEnrollment(
    enrollmentId: string,
    payload: ConfirmTotpEnrollmentRequest,
  ): Observable<RecoveryCodesResponse> {
    return this.http
      .post<SuccessResponse<RecoveryCodesResponse>>(
        `${this.baseUrl}/totp/enrollments/${encodeURIComponent(enrollmentId)}/confirm`,
        payload,
      )
      .pipe(map((response) => response.data));
  }

  regenerateRecoveryCodes(payload: MfaProtectedActionRequest): Observable<RecoveryCodesResponse> {
    return this.http
      .post<SuccessResponse<RecoveryCodesResponse>>(
        `${this.baseUrl}/recovery-codes/regenerate`,
        payload,
      )
      .pipe(map((response) => response.data));
  }

  disableTotp(payload: MfaProtectedActionRequest): Observable<void> {
    return this.http
      .delete<SuccessResponse<Record<string, never>>>(`${this.baseUrl}/totp`, { body: payload })
      .pipe(map(() => undefined));
  }

  issueStepUpGrant(payload: StepUpGrantRequest): Observable<StepUpGrantResponse> {
    return this.http
      .post<SuccessResponse<StepUpGrantResponse>>(`${this.baseUrl}/step-up-grants`, payload)
      .pipe(map((response) => response.data));
  }
}
