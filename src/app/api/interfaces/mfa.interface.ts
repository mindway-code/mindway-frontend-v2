export interface MfaStatus {
  enabled: boolean;
  enabledAt: string | null;
  recoveryCodesRemaining: number;
}

export interface StartTotpEnrollmentRequest {
  currentPassword: string;
}

export interface StartTotpEnrollmentResponse {
  enrollmentId: string;
  manualSecret: string;
  otpauthUri: string;
  expiresInSeconds: number;
}

export interface ConfirmTotpEnrollmentRequest {
  code: string;
}

export interface MfaProtectedActionRequest {
  currentPassword: string;
  code: string;
}

export interface RecoveryCodesResponse {
  recoveryCodes: string[];
}

export interface StepUpGrantRequest {
  method: 'TOTP' | 'RECOVERY_CODE';
  code: string;
  action: 'report.validate';
  resourceType: 'reportRevision';
  resourceId: string;
}

export interface StepUpGrantResponse {
  grant: string;
  expiresIn: number;
}
