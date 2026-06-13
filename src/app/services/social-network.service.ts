import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, catchError, finalize, map, tap, throwError } from "rxjs";
import { environment } from "../../environments/environment";
import type { PaginationMeta, PaginationQuery, SuccessResponse, DeleteResult } from "../api/interfaces/api-response.interface";
import type { CreateSocialNetworkDTO, SocialNetworkRecord, UpdateSocialNetworkDTO } from "../api/interfaces/social-network.interface";

@Injectable({ providedIn: "root" })
export class SocialNetworkService {
  private readonly apiUrl = environment.apiUrl;

  private readonly itemsSubject = new BehaviorSubject<SocialNetworkRecord[]>([]);
  private readonly selectedItemSubject = new BehaviorSubject<SocialNetworkRecord | null>(null);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  private readonly paginationSubject = new BehaviorSubject<PaginationMeta | null>(null);

  readonly items$ = this.itemsSubject.asObservable();
  readonly selectedItem$ = this.selectedItemSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();
  readonly pagination$ = this.paginationSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  list(query: PaginationQuery = {}): Observable<SocialNetworkRecord[]> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    let params = new HttpParams();
    if (query.page !== undefined) params = params.set("page", String(query.page));
    if (query.pageSize !== undefined) params = params.set("pageSize", String(query.pageSize));

    return this.http.get<SuccessResponse<SocialNetworkRecord[]>>(`${this.apiUrl}/social-networks`, { params }).pipe(
      tap((res) => {
        this.itemsSubject.next(res.data);
        this.paginationSubject.next(res.meta?.pagination ?? null);
      }),
      map((res) => res.data),
      catchError((err) => {
        // Backend middleware currently seems to block therapists; keep error generic.
        this.errorSubject.next("Não foi possível carregar as redes sociais.");
        return throwError(() => err);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  create(dto: CreateSocialNetworkDTO): Observable<SocialNetworkRecord> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.post<SuccessResponse<SocialNetworkRecord>>(`${this.apiUrl}/social-networks`, dto).pipe(
      map((res) => res.data),
      tap((created) => this.itemsSubject.next([created, ...this.itemsSubject.value])),
      catchError((err) => {
        this.errorSubject.next("Não foi possível criar a rede social.");
        return throwError(() => err);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  update(id: string, dto: UpdateSocialNetworkDTO): Observable<SocialNetworkRecord> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.put<SuccessResponse<SocialNetworkRecord>>(`${this.apiUrl}/social-networks/${id}`, dto).pipe(
      map((res) => res.data),
      tap((updated) => this.selectedItemSubject.next(updated)),
      catchError((err) => {
        this.errorSubject.next("Não foi possível atualizar a rede social.");
        return throwError(() => err);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  delete(id: string): Observable<DeleteResult> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.delete<SuccessResponse<DeleteResult>>(`${this.apiUrl}/social-networks/${id}`).pipe(
      map((res) => res.data),
      tap(() => this.itemsSubject.next(this.itemsSubject.value.filter((x) => x.id !== id))),
      catchError((err) => {
        this.errorSubject.next("Não foi possível excluir a rede social.");
        return throwError(() => err);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }
}
