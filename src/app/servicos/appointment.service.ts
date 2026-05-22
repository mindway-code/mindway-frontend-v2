import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, catchError, finalize, map, tap, throwError } from "rxjs";
import { environment } from "../../environments/environment";
import type { PaginationMeta, SuccessResponse, DeleteResult } from "../api/interfaces/api-response.interface";
import type {
  AppointmentRecord,
  AppointmentStatus,
  CreateAppointmentDTO,
  UpdateAppointmentDTO,
} from "../api/interfaces/appointment.interface";

export interface ListAppointmentsQuery {
  page?: number;
  pageSize?: number;
  status?: AppointmentStatus;
}

@Injectable({ providedIn: "root" })
export class AppointmentService {
  private readonly apiUrl = environment.apiUrl;

  private readonly itemsSubject = new BehaviorSubject<AppointmentRecord[]>([]);
  private readonly selectedItemSubject = new BehaviorSubject<AppointmentRecord | null>(null);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  private readonly paginationSubject = new BehaviorSubject<PaginationMeta | null>(null);

  readonly items$ = this.itemsSubject.asObservable();
  readonly selectedItem$ = this.selectedItemSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();
  readonly pagination$ = this.paginationSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  listMyAppointments(query: ListAppointmentsQuery = {}): Observable<AppointmentRecord[]> {
    return this.listInternal(`${this.apiUrl}/appointments`, query);
  }

  listMyTherapistAppointments(query: ListAppointmentsQuery = {}): Observable<AppointmentRecord[]> {
    return this.listInternal(`${this.apiUrl}/appointments/therapist`, query);
  }

  private listInternal(url: string, query: ListAppointmentsQuery): Observable<AppointmentRecord[]> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    let params = new HttpParams();
    if (query.page !== undefined) params = params.set("page", String(query.page));
    if (query.pageSize !== undefined) params = params.set("pageSize", String(query.pageSize));
    if (query.status) params = params.set("status", query.status);

    return this.http.get<SuccessResponse<AppointmentRecord[]>>(url, { params }).pipe(
      tap((res) => {
        this.itemsSubject.next(res.data);
        this.paginationSubject.next(res.meta?.pagination ?? null);
      }),
      map((res) => res.data),
      catchError((err) => {
        this.errorSubject.next("Could not load appointments.");
        return throwError(() => err);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  create(dto: CreateAppointmentDTO): Observable<AppointmentRecord> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.post<SuccessResponse<AppointmentRecord>>(`${this.apiUrl}/appointments`, dto).pipe(
      map((res) => res.data),
      tap((created) => this.itemsSubject.next([created, ...this.itemsSubject.value])),
      catchError((err) => {
        this.errorSubject.next("Could not create appointment.");
        return throwError(() => err);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  update(id: string, dto: UpdateAppointmentDTO): Observable<AppointmentRecord> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.put<SuccessResponse<AppointmentRecord>>(`${this.apiUrl}/appointments/${id}`, dto).pipe(
      map((res) => res.data),
      tap((updated) => this.selectedItemSubject.next(updated)),
      catchError((err) => {
        this.errorSubject.next("Could not update appointment.");
        return throwError(() => err);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  delete(id: string): Observable<DeleteResult> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.delete<SuccessResponse<DeleteResult>>(`${this.apiUrl}/appointments/${id}`).pipe(
      map((res) => res.data),
      tap(() => this.itemsSubject.next(this.itemsSubject.value.filter((x) => x.id !== id))),
      catchError((err) => {
        this.errorSubject.next("Could not delete appointment.");
        return throwError(() => err);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }
}
