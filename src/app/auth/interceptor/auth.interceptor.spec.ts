import { HttpErrorResponse, HttpHandler, HttpRequest } from '@angular/common/http';
import { throwError } from 'rxjs';
import { AuthInterceptor } from './auth.interceptor';

describe('AuthInterceptor MFA errors', () => {
  it('does not refresh or retry an invalid MFA code', (done) => {
    const tokenService = { getAccessToken: () => 'access-token' };
    const authService = {
      refreshToken: jasmine.createSpy(),
      clearAuthState: jasmine.createSpy(),
    };
    const router = { navigate: jasmine.createSpy() };
    const handler = {
      handle: jasmine.createSpy().and.returnValue(
        throwError(
          () =>
            new HttpErrorResponse({
              status: 401,
              error: { error: { code: 'MFA_CODE_INVALID' } },
            }),
        ),
      ),
    } as unknown as HttpHandler;
    const interceptor = new AuthInterceptor(tokenService as any, authService as any, router as any);

    interceptor
      .intercept(new HttpRequest('POST', '/api/auth/mfa/step-up-grants', {}), handler)
      .subscribe({
        error: () => {
          expect(authService.refreshToken).not.toHaveBeenCalled();
          expect(handler.handle).toHaveBeenCalledTimes(1);
          done();
        },
      });
  });
});
