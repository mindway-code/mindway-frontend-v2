import { Injectable } from "@angular/core";
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Observable, catchError, finalize, shareReplay, switchMap, throwError } from "rxjs";
import { environment } from "../../../environments/environment";
import { AuthService } from "../../servicos/auth.service";
import { TokenService } from "../../servicos/token.service";
import { Router } from "@angular/router";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private refreshInFlight$: Observable<string> | null = null;

  constructor(
    private readonly tokenService: TokenService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const apiUrl = environment.apiUrl;
    const isApiRequest = req.url.startsWith(apiUrl) || req.url.startsWith("/api");

    const isAuthEndpoint =
      req.url.includes("/auth/login") ||
      req.url.includes("/auth/register") ||
      req.url.includes("/auth/refresh") ||
      req.url.includes("/auth/logout");

    const accessToken = this.tokenService.getAccessToken();

    let authReq = req;

    if (isApiRequest) {
      authReq = authReq.clone({ withCredentials: true });
    }

    if (isApiRequest && accessToken && !isAuthEndpoint) {
      authReq = authReq.clone({
        setHeaders: { Authorization: `Bearer ${accessToken}` },
      });
    }

    return next.handle(authReq).pipe(
      catchError((err: unknown) => {
        if (!isApiRequest) return throwError(() => err);
        if (isAuthEndpoint) return throwError(() => err);

        if (err instanceof HttpErrorResponse && err.status === 401) {
          return this.refreshOnce().pipe(
            switchMap((newToken) => {
              const retryReq = authReq.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` },
              });
              return next.handle(retryReq);
            }),
            catchError((refreshErr) => {
              this.authService.clearAuthState();
              this.router.navigate(["/login"]);
              return throwError(() => refreshErr);
            })
          );
        }

        return throwError(() => err);
      })
    );
  }

  private refreshOnce(): Observable<string> {
    if (!this.refreshInFlight$) {
      this.refreshInFlight$ = this.authService.refreshToken().pipe(
        shareReplay({ bufferSize: 1, refCount: true }),
        finalize(() => {
          this.refreshInFlight$ = null;
        })
      );
    }

    return this.refreshInFlight$;
  }
}

