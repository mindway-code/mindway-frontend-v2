import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, catchError, finalize, map, tap, throwError } from "rxjs";
import { environment } from "../../environments/environment";
import type { SuccessResponse, PaginationMeta } from "../api/interfaces/api-response.interface";
import type { ChildRecord, CreateChildDTO } from "../api/interfaces/child.interface";

export interface ListChildrenQuery {
  page?: number;
  pageSize?: number;
}

@Injectable({ providedIn: "root" })
export class ChildService {
  private readonly apiUrl = environment.apiUrl;
  private readonly childrenUrl = `${this.apiUrl}/children`;
  private readonly myChildrenUrl = `${this.apiUrl}/children/me`;

  private readonly childrenSubject = new BehaviorSubject<ChildRecord[]>([]);
  private readonly selectedChildSubject = new BehaviorSubject<ChildRecord | null>(null);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly savingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  private readonly paginationSubject = new BehaviorSubject<PaginationMeta | null>(null);

  readonly children$ = this.childrenSubject.asObservable();
  readonly selectedChild$ = this.selectedChildSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly saving$ = this.savingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();
  readonly pagination$ = this.paginationSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  loadMyChildren(query: ListChildrenQuery = {}): Observable<ChildRecord[]> {
    return this.loadChildren(query);
  }

  loadAccessibleChildren(query: ListChildrenQuery = {}): Observable<ChildRecord[]> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    let params = new HttpParams();
    if (query.page !== undefined) params = params.set("page", String(query.page));
    if (query.pageSize !== undefined) params = params.set("pageSize", String(query.pageSize));

    return this.http.get<SuccessResponse<ChildRecord[]>>(this.myChildrenUrl, { params }).pipe(
      tap((res) => {
        this.childrenSubject.next(res.data);
        this.paginationSubject.next(res.meta?.pagination ?? null);

        const selected = this.selectedChildSubject.value;
        if (selected && !res.data.some((child) => child.id === selected.id)) {
          this.selectedChildSubject.next(null);
        }
      }),
      map((res) => res.data),
      catchError((err) => {
        this.errorSubject.next("Não foi possível carregar as crianças.");
        return throwError(() => err);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  loadChildren(query: ListChildrenQuery = {}): Observable<ChildRecord[]> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    let params = new HttpParams();
    if (query.page !== undefined) params = params.set("page", String(query.page));
    if (query.pageSize !== undefined) params = params.set("pageSize", String(query.pageSize));

    return this.http.get<SuccessResponse<ChildRecord[]>>(this.childrenUrl, { params }).pipe(
      tap((res) => {
        this.childrenSubject.next(res.data);
        this.paginationSubject.next(res.meta?.pagination ?? null);
      }),
      map((res) => res.data),
      catchError((err) => {
        this.errorSubject.next("Não foi possível carregar as crianças.");
        return throwError(() => err);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  selectChild(child: ChildRecord | null): void {
    this.selectedChildSubject.next(child);
  }

  selectChildById(childId: string | null): void {
    const normalized = childId?.trim() ?? "";
    if (!normalized) {
      this.selectedChildSubject.next(null);
      return;
    }

    const match = this.childrenSubject.value.find((child) => child.id === normalized) ?? null;
    this.selectedChildSubject.next(match);
  }

  getChildrenSnapshot(): ChildRecord[] {
    return this.childrenSubject.value;
  }

  getSelectedChildSnapshot(): ChildRecord | null {
    return this.selectedChildSubject.value;
  }

  createChild(payload: CreateChildDTO): Observable<ChildRecord> {
    this.savingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.post<SuccessResponse<ChildRecord>>(this.childrenUrl, payload).pipe(
      map((res) => res.data),
      tap((created) => {
        this.childrenSubject.next([created, ...this.childrenSubject.value]);
      }),
      catchError((err) => {
        this.errorSubject.next("Não foi possível criar o perfil infantil.");
        return throwError(() => err);
      }),
      finalize(() => this.savingSubject.next(false))
    );
  }
}
