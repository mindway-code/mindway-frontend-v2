import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, catchError, finalize, map, tap, throwError } from "rxjs";
import { environment } from "../../environments/environment";
import type { PaginationMeta, PaginationQuery, SuccessResponse } from "../api/interfaces/api-response.interface";
import type {
  CreateReportsChildDTO,
  ReportsChildRecord,
  UpdateReportsChildDTO,
} from "../api/interfaces/reports-child.interface";

@Injectable({ providedIn: "root" })
export class ReportsChildService {
  private readonly apiUrl = environment.apiUrl;
  private readonly baseUrl = `${this.apiUrl}/reports-children`;

  private readonly reportsSubject = new BehaviorSubject<ReportsChildRecord[]>([]);
  private readonly selectedReportSubject = new BehaviorSubject<ReportsChildRecord | null>(null);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly savingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  private readonly paginationSubject = new BehaviorSubject<PaginationMeta | null>(null);

  readonly reports$ = this.reportsSubject.asObservable();
  readonly selectedReport$ = this.selectedReportSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly saving$ = this.savingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();
  readonly pagination$ = this.paginationSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  loadByChildId(childId: string, query: PaginationQuery = {}): Observable<ReportsChildRecord[]> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    let params = new HttpParams();
    if (query.page !== undefined) params = params.set("page", String(query.page));
    if (query.pageSize !== undefined) params = params.set("pageSize", String(query.pageSize));

    return this.http.get<SuccessResponse<ReportsChildRecord[]>>(`${this.baseUrl}/child/${childId}`, { params }).pipe(
      tap((res) => {
        this.reportsSubject.next(res.data);
        this.paginationSubject.next(res.meta?.pagination ?? null);
      }),
      map((res) => res.data),
      catchError((err) => {
        this.errorSubject.next("Could not load reports.");
        return throwError(() => err);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  createReport(childId: string, payload: CreateReportsChildDTO): Observable<ReportsChildRecord> {
    this.savingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.post<SuccessResponse<ReportsChildRecord>>(`${this.baseUrl}/child/${childId}`, payload).pipe(
      map((res) => res.data),
      tap((created) => {
        this.reportsSubject.next([created, ...this.reportsSubject.value]);
      }),
      catchError((err) => {
        this.errorSubject.next("Could not create report.");
        return throwError(() => err);
      }),
      finalize(() => this.savingSubject.next(false))
    );
  }

  updateReport(reportId: string, payload: UpdateReportsChildDTO): Observable<ReportsChildRecord> {
    this.savingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.patch<SuccessResponse<ReportsChildRecord>>(`${this.baseUrl}/${reportId}`, payload).pipe(
      map((res) => res.data),
      tap((updated) => {
        const next = this.reportsSubject.value.map((r) => (r.id === updated.id ? updated : r));
        this.reportsSubject.next(next);
        const selected = this.selectedReportSubject.value;
        if (selected?.id === updated.id) this.selectedReportSubject.next(updated);
      }),
      catchError((err) => {
        this.errorSubject.next("Could not update report.");
        return throwError(() => err);
      }),
      finalize(() => this.savingSubject.next(false))
    );
  }

  deleteReport(reportId: string): Observable<void> {
    this.savingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.delete<SuccessResponse<{ id: string }>>(`${this.baseUrl}/${reportId}`).pipe(
      map(() => undefined),
      tap(() => {
        this.reportsSubject.next(this.reportsSubject.value.filter((r) => r.id !== reportId));
        const selected = this.selectedReportSubject.value;
        if (selected?.id === reportId) this.selectedReportSubject.next(null);
      }),
      catchError((err) => {
        this.errorSubject.next("Could not delete report.");
        return throwError(() => err);
      }),
      finalize(() => this.savingSubject.next(false))
    );
  }

  selectReport(report: ReportsChildRecord | null): void {
    this.selectedReportSubject.next(report);
  }

  clearState(): void {
    this.reportsSubject.next([]);
    this.selectedReportSubject.next(null);
    this.loadingSubject.next(false);
    this.savingSubject.next(false);
    this.errorSubject.next(null);
    this.paginationSubject.next(null);
  }
}

