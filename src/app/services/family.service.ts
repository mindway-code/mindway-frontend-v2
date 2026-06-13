import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, catchError, finalize, map, tap, throwError } from "rxjs";
import { environment } from "../../environments/environment";
import type { PaginationMeta, PaginationQuery, SuccessResponse, DeleteResult } from "../api/interfaces/api-response.interface";
import type { CreateFamilyDTO, FamilyRecord, UpdateFamilyDTO } from "../api/interfaces/family.interface";

@Injectable({ providedIn: "root" })
export class FamilyService {
  private readonly apiUrl = environment.apiUrl;

  private readonly itemsSubject = new BehaviorSubject<FamilyRecord[]>([]);
  private readonly selectedItemSubject = new BehaviorSubject<FamilyRecord | null>(null);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  private readonly paginationSubject = new BehaviorSubject<PaginationMeta | null>(null);

  readonly items$ = this.itemsSubject.asObservable();
  readonly selectedItem$ = this.selectedItemSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();
  readonly pagination$ = this.paginationSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  listMyFamilies(query: PaginationQuery = {}): Observable<FamilyRecord[]> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    let params = new HttpParams();
    if (query.page !== undefined) params = params.set("page", String(query.page));
    if (query.pageSize !== undefined) params = params.set("pageSize", String(query.pageSize));

    return this.http
      .get<SuccessResponse<FamilyRecord[]>>(`${this.apiUrl}/families/me`, { params })
      .pipe(
        tap((res) => {
          this.itemsSubject.next(res.data);
          this.paginationSubject.next(res.meta?.pagination ?? null);
        }),
        map((res) => res.data),
        catchError((err) => {
          this.errorSubject.next("Não foi possível carregar as famílias.");
          return throwError(() => err);
        }),
        finalize(() => this.loadingSubject.next(false))
      );
  }

  listFamilies(query: PaginationQuery = {}): Observable<FamilyRecord[]> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    let params = new HttpParams();
    if (query.page !== undefined) params = params.set("page", String(query.page));
    if (query.pageSize !== undefined) params = params.set("pageSize", String(query.pageSize));

    return this.http
      .get<SuccessResponse<FamilyRecord[]>>(`${this.apiUrl}/families`, { params })
      .pipe(
        tap((res) => {
          this.itemsSubject.next(res.data);
          this.paginationSubject.next(res.meta?.pagination ?? null);
        }),
        map((res) => res.data),
        catchError((err) => {
          this.errorSubject.next("Não foi possível carregar as famílias.");
          return throwError(() => err);
        }),
        finalize(() => this.loadingSubject.next(false))
      );
  }

  createFamily(dto: CreateFamilyDTO): Observable<FamilyRecord> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.post<SuccessResponse<FamilyRecord>>(`${this.apiUrl}/families`, dto).pipe(
      map((res) => res.data),
      tap((created) => this.itemsSubject.next([created, ...this.itemsSubject.value])),
      catchError((err) => {
        this.errorSubject.next("Não foi possível criar a família.");
        return throwError(() => err);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  /**
   * NOTE: Backend issue (as of current repo state):
   * - frontend route is `/families/me` without `:id`
   * - backend controller/service expects `req.params.id`
   * Treat these as TODO until backend is fixed.
   */
  updateMyFamily(_dto: UpdateFamilyDTO): Observable<FamilyRecord> {
    this.errorSubject.next("Não foi possível atualizar a família no momento.");
    return throwError(() => new Error("Backend route PUT /families/me is not usable yet."));
  }

  deleteMyFamily(): Observable<DeleteResult> {
    this.errorSubject.next("Não foi possível excluir a família no momento.");
    return throwError(() => new Error("Backend route DELETE /families/me is not usable yet."));
  }
}
