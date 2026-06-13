import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, catchError, finalize, map, tap, throwError } from "rxjs";
import { environment } from "../../environments/environment";
import type { PaginationMeta, SuccessResponse, DeleteResult } from "../api/interfaces/api-response.interface";
import type { CreateTaskDTO, TaskRecord, TaskStatus, UpdateTaskDTO } from "../api/interfaces/task.interface";

export interface ListTasksQuery {
  page?: number;
  pageSize?: number;
  status?: TaskStatus;
}

@Injectable({ providedIn: "root" })
export class TaskService {
  private readonly apiUrl = environment.apiUrl;

  private readonly itemsSubject = new BehaviorSubject<TaskRecord[]>([]);
  private readonly selectedItemSubject = new BehaviorSubject<TaskRecord | null>(null);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  private readonly paginationSubject = new BehaviorSubject<PaginationMeta | null>(null);

  readonly items$ = this.itemsSubject.asObservable();
  readonly selectedItem$ = this.selectedItemSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();
  readonly pagination$ = this.paginationSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  listMyTasks(query: ListTasksQuery = {}): Observable<TaskRecord[]> {
    return this.listInternal(`${this.apiUrl}/tasks`, query);
  }

  listMyTherapistTasks(query: ListTasksQuery = {}): Observable<TaskRecord[]> {
    return this.listInternal(`${this.apiUrl}/tasks/therapist`, query);
  }

  private listInternal(url: string, query: ListTasksQuery): Observable<TaskRecord[]> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    let params = new HttpParams();
    if (query.page !== undefined) params = params.set("page", String(query.page));
    if (query.pageSize !== undefined) params = params.set("pageSize", String(query.pageSize));
    if (query.status) params = params.set("status", query.status);

    return this.http.get<SuccessResponse<TaskRecord[]>>(url, { params }).pipe(
      tap((res) => {
        this.itemsSubject.next(res.data);
        this.paginationSubject.next(res.meta?.pagination ?? null);
      }),
      map((res) => res.data),
      catchError((err) => {
        this.errorSubject.next("Não foi possível carregar as tarefas.");
        return throwError(() => err);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  create(dto: CreateTaskDTO): Observable<TaskRecord> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.post<SuccessResponse<TaskRecord>>(`${this.apiUrl}/tasks`, dto).pipe(
      map((res) => res.data),
      tap((created) => this.itemsSubject.next([created, ...this.itemsSubject.value])),
      catchError((err) => {
        this.errorSubject.next("Não foi possível criar a tarefa.");
        return throwError(() => err);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  update(id: string, dto: UpdateTaskDTO): Observable<TaskRecord> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.put<SuccessResponse<TaskRecord>>(`${this.apiUrl}/tasks/${id}`, dto).pipe(
      map((res) => res.data),
      tap((updated) => this.selectedItemSubject.next(updated)),
      catchError((err) => {
        this.errorSubject.next("Não foi possível atualizar a tarefa.");
        return throwError(() => err);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  delete(id: string): Observable<DeleteResult> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.delete<SuccessResponse<DeleteResult>>(`${this.apiUrl}/tasks/${id}`).pipe(
      map((res) => res.data),
      tap(() => this.itemsSubject.next(this.itemsSubject.value.filter((x) => x.id !== id))),
      catchError((err) => {
        this.errorSubject.next("Não foi possível excluir a tarefa.");
        return throwError(() => err);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }
}
