import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, catchError, finalize, map, tap, throwError } from "rxjs";
import { environment } from "../../environments/environment";
import type { PaginationMeta, SuccessResponse, DeleteResult } from "../api/interfaces/api-response.interface";
import type { CreateMessageDTO, MessageRecord } from "../api/interfaces/message.interface";

export interface ListMessagesQuery {
  page?: number;
  pageSize?: number;
}

@Injectable({ providedIn: "root" })
export class MessageService {
  private readonly apiUrl = environment.apiUrl;

  private readonly itemsSubject = new BehaviorSubject<MessageRecord[]>([]);
  private readonly selectedItemSubject = new BehaviorSubject<MessageRecord | null>(null);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  private readonly paginationSubject = new BehaviorSubject<PaginationMeta | null>(null);

  readonly items$ = this.itemsSubject.asObservable();
  readonly selectedItem$ = this.selectedItemSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();
  readonly pagination$ = this.paginationSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  listDirectMessages(userId: string, query: ListMessagesQuery = {}): Observable<MessageRecord[]> {
    return this.listInternal(`${this.apiUrl}/messages/dm/${userId}`, query);
  }

  sendDirectMessage(userId: string, dto: CreateMessageDTO): Observable<MessageRecord> {
    return this.sendInternal(`${this.apiUrl}/messages/dm/${userId}`, dto);
  }

  listSocialNetworkMessages(socialNetworkId: string, query: ListMessagesQuery = {}): Observable<MessageRecord[]> {
    return this.listInternal(`${this.apiUrl}/messages/social-networks/${socialNetworkId}`, query);
  }

  sendSocialNetworkMessage(socialNetworkId: string, dto: CreateMessageDTO): Observable<MessageRecord> {
    return this.sendInternal(`${this.apiUrl}/messages/social-networks/${socialNetworkId}`, dto);
  }

  private listInternal(url: string, query: ListMessagesQuery): Observable<MessageRecord[]> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    let params = new HttpParams();
    if (query.page !== undefined) params = params.set("page", String(query.page));
    if (query.pageSize !== undefined) params = params.set("pageSize", String(query.pageSize));

    return this.http.get<SuccessResponse<MessageRecord[]>>(url, { params }).pipe(
      tap((res) => {
        this.itemsSubject.next(res.data);
        const meta = (res as any).meta?.pagination as PaginationMeta | undefined;
        this.paginationSubject.next(meta ?? null);
      }),
      map((res) => res.data),
      catchError((err) => {
        this.errorSubject.next("Could not load messages.");
        return throwError(() => err);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  private sendInternal(url: string, dto: CreateMessageDTO): Observable<MessageRecord> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.post<SuccessResponse<MessageRecord>>(url, dto).pipe(
      map((res) => res.data),
      tap((created) => this.itemsSubject.next([created, ...this.itemsSubject.value])),
      catchError((err) => {
        this.errorSubject.next("Could not send message.");
        return throwError(() => err);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  delete(messageId: string): Observable<DeleteResult> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.delete<SuccessResponse<DeleteResult>>(`${this.apiUrl}/messages/${messageId}`).pipe(
      map((res) => res.data),
      tap(() => this.itemsSubject.next(this.itemsSubject.value.filter((m) => m.id !== messageId))),
      catchError((err) => {
        this.errorSubject.next("Could not delete message.");
        return throwError(() => err);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }
}
