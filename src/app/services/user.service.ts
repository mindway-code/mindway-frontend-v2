import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, catchError, finalize, map, of, tap, throwError } from "rxjs";
import { environment } from "../../environments/environment";
import type { PaginationMeta, PaginationQuery, SuccessResponse, DeleteResult } from "../api/interfaces/api-response.interface";
import type { UpdateUserDTO, UserDTO, UserRecord } from "../api/interfaces/user.interface";

@Injectable({ providedIn: "root" })
export class UserService {
  private readonly apiUrl = environment.apiUrl;

  private readonly itemsSubject = new BehaviorSubject<UserRecord[]>([]);
  private readonly currentUserSubject = new BehaviorSubject<UserRecord | null>(null);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly savingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  private readonly paginationSubject = new BehaviorSubject<PaginationMeta | null>(null);

  readonly items$ = this.itemsSubject.asObservable();
  readonly currentUser$ = this.currentUserSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly saving$ = this.savingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();
  readonly pagination$ = this.paginationSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  loadMe(): Observable<UserRecord> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.get<SuccessResponse<UserRecord>>(`${this.apiUrl}/users/me`).pipe(
      map((res) => res.data),
      tap((me) => this.currentUserSubject.next(me)),
      catchError((err) => {
        this.errorSubject.next("Não foi possível carregar o perfil.");
        return throwError(() => err);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  listUsers(query: PaginationQuery = {}): Observable<UserRecord[]> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    let params = new HttpParams();
    if (query.page !== undefined) params = params.set("page", String(query.page));
    if (query.pageSize !== undefined) params = params.set("pageSize", String(query.pageSize));

    return this.http
      .get<SuccessResponse<UserRecord[]>>(`${this.apiUrl}/users`, { params })
      .pipe(
        tap((res) => {
          this.itemsSubject.next(res.data);
          this.paginationSubject.next(res.meta?.pagination ?? null);
        }),
        map((res) => res.data),
        catchError((err) => {
          this.errorSubject.next("Não foi possível carregar os usuários.");
          return throwError(() => err);
        }),
        finalize(() => this.loadingSubject.next(false))
      );
  }

  createUser(dto: UserDTO): Observable<UserRecord> {
    this.savingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.post<SuccessResponse<UserRecord>>(`${this.apiUrl}/users`, dto).pipe(
      map((res) => res.data),
      tap((created) => {
        this.itemsSubject.next([created, ...this.itemsSubject.value]);
      }),
      catchError((err) => {
        this.errorSubject.next("Não foi possível criar o usuário.");
        return throwError(() => err);
      }),
      finalize(() => this.savingSubject.next(false))
    );
  }

  updateMe(dto: UpdateUserDTO): Observable<UserRecord> {
    this.savingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.patch<SuccessResponse<UserRecord>>(`${this.apiUrl}/users/me`, dto).pipe(
      map((res) => res.data),
      tap((updated) => this.currentUserSubject.next(updated)),
      catchError((err) => {
        this.errorSubject.next("Não foi possível atualizar o perfil.");
        return throwError(() => err);
      }),
      finalize(() => this.savingSubject.next(false))
    );
  }

  deleteMe(): Observable<DeleteResult> {
    this.savingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.delete<SuccessResponse<DeleteResult>>(`${this.apiUrl}/users/me`).pipe(
      map((res) => res.data),
      tap(() => {
        this.currentUserSubject.next(null);
      }),
      catchError((err) => {
        this.errorSubject.next("Não foi possível excluir o usuário.");
        return throwError(() => err);
      }),
      finalize(() => this.savingSubject.next(false))
    );
  }
}
