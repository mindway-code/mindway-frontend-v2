import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, catchError, finalize, map, tap, throwError } from "rxjs";
import { environment } from "../../environments/environment";
import type { PaginationMeta, SuccessResponse, DeleteResult } from "../api/interfaces/api-response.interface";
import type {
  CreateFamilyMemberDTO,
  FamilyMemberRecord,
  UpdateFamilyMemberDTO,
} from "../api/interfaces/family-member.interface";

export interface ListFamilyMembersQuery {
  page?: number;
  pageSize?: number;
  familyId?: string;
  userId?: string;
}

@Injectable({ providedIn: "root" })
export class FamilyMemberService {
  private readonly apiUrl = environment.apiUrl;

  private readonly itemsSubject = new BehaviorSubject<FamilyMemberRecord[]>([]);
  private readonly selectedItemSubject = new BehaviorSubject<FamilyMemberRecord | null>(null);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  private readonly paginationSubject = new BehaviorSubject<PaginationMeta | null>(null);

  readonly items$ = this.itemsSubject.asObservable();
  readonly selectedItem$ = this.selectedItemSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();
  readonly pagination$ = this.paginationSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  list(query: ListFamilyMembersQuery = {}): Observable<FamilyMemberRecord[]> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    let params = new HttpParams();
    if (query.page !== undefined) params = params.set("page", String(query.page));
    if (query.pageSize !== undefined) params = params.set("pageSize", String(query.pageSize));
    if (query.familyId) params = params.set("familyId", query.familyId);
    if (query.userId) params = params.set("userId", query.userId);

    return this.http.get<SuccessResponse<FamilyMemberRecord[]>>(`${this.apiUrl}/family-members`, { params }).pipe(
      tap((res) => {
        this.itemsSubject.next(res.data);
        this.paginationSubject.next(res.meta?.pagination ?? null);
      }),
      map((res) => res.data),
      catchError((err) => {
        this.errorSubject.next("Could not load family members.");
        return throwError(() => err);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  getById(id: string): Observable<FamilyMemberRecord> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.get<SuccessResponse<FamilyMemberRecord>>(`${this.apiUrl}/family-members/${id}`).pipe(
      map((res) => res.data),
      tap((item) => this.selectedItemSubject.next(item)),
      catchError((err) => {
        this.errorSubject.next("Could not load family member.");
        return throwError(() => err);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  create(dto: CreateFamilyMemberDTO): Observable<FamilyMemberRecord> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.post<SuccessResponse<FamilyMemberRecord>>(`${this.apiUrl}/family-members`, dto).pipe(
      map((res) => res.data),
      tap((created) => this.itemsSubject.next([created, ...this.itemsSubject.value])),
      catchError((err) => {
        this.errorSubject.next("Could not create family member.");
        return throwError(() => err);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  update(id: string, dto: UpdateFamilyMemberDTO): Observable<FamilyMemberRecord> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.put<SuccessResponse<FamilyMemberRecord>>(`${this.apiUrl}/family-members/${id}`, dto).pipe(
      map((res) => res.data),
      tap((updated) => this.selectedItemSubject.next(updated)),
      catchError((err) => {
        this.errorSubject.next("Could not update family member.");
        return throwError(() => err);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  delete(id: string): Observable<DeleteResult> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.delete<SuccessResponse<DeleteResult>>(`${this.apiUrl}/family-members/${id}`).pipe(
      map((res) => res.data),
      tap(() => {
        this.itemsSubject.next(this.itemsSubject.value.filter((x) => x.id !== id));
      }),
      catchError((err) => {
        this.errorSubject.next("Could not delete family member.");
        return throwError(() => err);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }
}
