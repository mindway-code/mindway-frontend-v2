import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, catchError, finalize, map, throwError } from "rxjs";
import { environment } from "../../environments/environment";
import type { ErrorResponse, SuccessResponse } from "../api/interfaces/api-response.interface";
import type { AssociateChildResult, CreateAssociationChildDTO } from "../api/interfaces/association-child.interface";

function toMessage(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse) {
    const data = err.error as Partial<ErrorResponse> | undefined;
    const msg = data?.error?.message;
    if (typeof msg === "string" && msg.trim()) return msg;
  }
  return fallback;
}

@Injectable({ providedIn: "root" })
export class AssociationChildService {
  private readonly apiUrl = environment.apiUrl;
  private readonly associationChildrenUrl = `${this.apiUrl}/association-children`;

  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  associateByAccessCode(payload: CreateAssociationChildDTO): Observable<AssociateChildResult> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.post<SuccessResponse<AssociateChildResult>>(this.associationChildrenUrl, payload).pipe(
      map((res) => res.data),
      catchError((err) => {
        this.errorSubject.next(toMessage(err, "Could not connect child."));
        return throwError(() => err);
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }
}

