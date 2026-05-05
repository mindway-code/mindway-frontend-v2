import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, catchError, finalize, map, of, switchMap, tap, throwError } from "rxjs";
import { environment } from "../../environments/environment";
import type { SuccessResponse, ErrorResponse } from "../api/interfaces/api-response.interface";
import type { LoginPayload, RegisterDTO } from "../api/interfaces/auth.interface";
import type { UserRecord } from "../api/interfaces/user.interface";
import { TokenService } from "./token.service";

function toMessage(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse) {
    const data = err.error as Partial<ErrorResponse> | undefined;
    const msg = data?.error?.message;
    if (typeof msg === "string" && msg.trim()) return msg;
  }
  return fallback;
}

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly apiUrl = environment.apiUrl;

  private readonly currentUserSubject = new BehaviorSubject<UserRecord | null>(null);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  readonly currentUser$ = this.currentUserSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();
  readonly isAuthenticated$ = this.currentUser$.pipe(map((u) => Boolean(u)));

  constructor(
    private readonly http: HttpClient,
    private readonly tokenService: TokenService
  ) {}

  getAccessToken(): string | null {
    return this.tokenService.getAccessToken();
  }

  clearAuthState(): void {
    this.tokenService.clearAccessToken();
    this.currentUserSubject.next(null);
    this.errorSubject.next(null);
  }

  login(payload: LoginPayload): Observable<string> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http
      .post<SuccessResponse<{ accessToken: string }>>(`${this.apiUrl}/auth/login`, payload, {
        withCredentials: true,
      })
      .pipe(
        map((res) => res.data.accessToken),
        tap((token) => this.tokenService.setAccessToken(token)),
        tap(() => void 0),
        catchError((err) => {
          this.errorSubject.next(toMessage(err, "Invalid email or password."));
          return throwError(() => err);
        }),
        finalize(() => this.loadingSubject.next(false))
      );
  }

  register(payload: RegisterDTO): Observable<string> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http
      .post<SuccessResponse<{ accessToken: string }>>(`${this.apiUrl}/auth/register`, payload, {
        withCredentials: true,
      })
      .pipe(
        map((res) => res.data.accessToken),
        tap((token) => this.tokenService.setAccessToken(token)),
        catchError((err) => {
          this.errorSubject.next(toMessage(err, "Could not register."));
          return throwError(() => err);
        }),
        finalize(() => this.loadingSubject.next(false))
      );
  }

  refreshToken(): Observable<string> {
    return this.http
      .post<SuccessResponse<{ accessToken: string }>>(
        `${this.apiUrl}/auth/refresh`,
        {},
        { withCredentials: true }
      )
      .pipe(
        map((res) => res.data.accessToken),
        tap((token) => this.tokenService.setAccessToken(token))
      );
  }

  logout(): Observable<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http
      .post<SuccessResponse<unknown>>(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true })
      .pipe(
        map(() => void 0),
        tap(() => this.clearAuthState()),
        catchError((err) => {
          // If backend is unreachable, still clear local state.
          this.clearAuthState();
          this.errorSubject.next(toMessage(err, "Logged out locally."));
          return of(void 0);
        }),
        finalize(() => this.loadingSubject.next(false))
      );
  }

  loadCurrentUser(): Observable<UserRecord> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.get<SuccessResponse<UserRecord>>(`${this.apiUrl}/users/me`).pipe(
      map((res) => res.data),
      tap((user) => this.currentUserSubject.next(user)),
      catchError((err) => {
        this.errorSubject.next(toMessage(err, "Could not load current user."));
        return throwError(() => err);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  /**
   * Best-effort session restore:
   * - if an access token exists, try loading /users/me
   * - else try refresh (cookie) then load /users/me
   */
  restoreSession(): Observable<UserRecord | null> {
    const token = this.tokenService.getAccessToken();
    const source$ = token ? of(token) : this.refreshToken();

    return source$.pipe(
      switchMap(() => this.loadCurrentUser()),
      map((user) => user),
      catchError(() => {
        this.clearAuthState();
        return of(null);
      })
    );
  }
}
