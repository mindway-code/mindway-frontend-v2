import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, catchError, finalize, map, of, tap, throwError } from "rxjs";
import { environment } from "../../environments/environment";
import type { SuccessResponse } from "../api/interfaces/api-response.interface";
import type {
  AnamnesisRecord,
  UpdateAnamnesisGeneralNotesDTO,
  UpsertAnamnesisBehaviorDTO,
  UpsertAnamnesisBirthDTO,
  UpsertAnamnesisHealthDTO,
  UpsertAnamnesisLanguageCommunicationDTO,
  UpsertAnamnesisMotorDevelopmentDTO,
  UpsertAnamnesisRoutineDTO,
} from "../api/interfaces/anamnesis.interface";

type AnamnesisSectionKey =
  | "birth"
  | "motorDevelopment"
  | "languageCommunication"
  | "health"
  | "behavior"
  | "routine";

@Injectable({ providedIn: "root" })
export class AnamnesisService {
  private readonly apiUrl = environment.apiUrl;
  // Routes aligned with `api` backend module: `/children/:childId/anamnesis/...`.

  private readonly anamnesisSubject = new BehaviorSubject<AnamnesisRecord | null>(null);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly savingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  readonly anamnesis$ = this.anamnesisSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly saving$ = this.savingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  loadByChildId(childId: string): Observable<AnamnesisRecord | null> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http
      .get<SuccessResponse<AnamnesisRecord | null>>(`${this.apiUrl}/children/${childId}/anamnesis`)
      .pipe(
        map((res) => res.data),
        tap((anamnesis) => this.anamnesisSubject.next(anamnesis)),
        catchError((err: unknown) => {
          const status = (err as { status?: number } | null)?.status;
          if (status === 404) {
            this.anamnesisSubject.next(null);
            return of(null);
          }

          this.errorSubject.next("Could not load anamnesis.");
          return throwError(() => err);
        }),
        finalize(() => this.loadingSubject.next(false))
      );
  }

  createAnamnesis(childId: string): Observable<AnamnesisRecord> {
    this.savingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.post<SuccessResponse<AnamnesisRecord>>(`${this.apiUrl}/children/${childId}/anamnesis`, {}).pipe(
      map((res) => res.data),
      tap((created) => this.anamnesisSubject.next(created)),
      catchError((err) => {
        this.errorSubject.next("Could not create anamnesis.");
        return throwError(() => err);
      }),
      finalize(() => this.savingSubject.next(false))
    );
  }

  updateGeneralNotes(childId: string, payload: UpdateAnamnesisGeneralNotesDTO): Observable<AnamnesisRecord> {
    this.savingSubject.next(true);
    this.errorSubject.next(null);

    return this.http
      .patch<SuccessResponse<AnamnesisRecord>>(`${this.apiUrl}/children/${childId}/anamnesis/general-notes`, payload)
      .pipe(
        map((res) => res.data),
        tap((updated) => this.anamnesisSubject.next(updated)),
        catchError((err) => {
          this.errorSubject.next("Could not update general notes.");
          return throwError(() => err);
        }),
        finalize(() => this.savingSubject.next(false))
      );
  }

  upsertBirth(childId: string, payload: UpsertAnamnesisBirthDTO, exists: boolean): Observable<AnamnesisRecord> {
    return this.upsertSection(childId, "birth", payload, exists, "Could not save birth information.");
  }

  deleteBirth(childId: string): Observable<void> {
    return this.deleteSection(childId, "birth", "Could not delete birth information.");
  }

  upsertMotorDevelopment(
    childId: string,
    payload: UpsertAnamnesisMotorDevelopmentDTO,
    exists: boolean
  ): Observable<AnamnesisRecord> {
    return this.upsertSection(childId, "motor-development", payload, exists, "Could not save motor development.");
  }

  deleteMotorDevelopment(childId: string): Observable<void> {
    return this.deleteSection(childId, "motorDevelopment", "Could not delete motor development.");
  }

  upsertLanguageCommunication(
    childId: string,
    payload: UpsertAnamnesisLanguageCommunicationDTO,
    exists: boolean
  ): Observable<AnamnesisRecord> {
    return this.upsertSection(
      childId,
      "language-communication",
      payload,
      exists,
      "Could not save language and communication."
    );
  }

  deleteLanguageCommunication(childId: string): Observable<void> {
    return this.deleteSection(childId, "languageCommunication", "Could not delete language and communication.");
  }

  upsertHealth(childId: string, payload: UpsertAnamnesisHealthDTO, exists: boolean): Observable<AnamnesisRecord> {
    return this.upsertSection(childId, "health", payload, exists, "Could not save health information.");
  }

  deleteHealth(childId: string): Observable<void> {
    return this.deleteSection(childId, "health", "Could not delete health information.");
  }

  upsertBehavior(childId: string, payload: UpsertAnamnesisBehaviorDTO, exists: boolean): Observable<AnamnesisRecord> {
    return this.upsertSection(childId, "behavior", payload, exists, "Could not save behavior information.");
  }

  deleteBehavior(childId: string): Observable<void> {
    return this.deleteSection(childId, "behavior", "Could not delete behavior information.");
  }

  upsertRoutine(childId: string, payload: UpsertAnamnesisRoutineDTO, exists: boolean): Observable<AnamnesisRecord> {
    return this.upsertSection(childId, "routine", payload, exists, "Could not save routine information.");
  }

  deleteRoutine(childId: string): Observable<void> {
    return this.deleteSection(childId, "routine", "Could not delete routine information.");
  }

  clearState(): void {
    this.anamnesisSubject.next(null);
    this.loadingSubject.next(false);
    this.savingSubject.next(false);
    this.errorSubject.next(null);
  }

  private upsertSection<TPayload extends object>(
    childId: string,
    routeSegment: string,
    payload: TPayload,
    exists: boolean,
    errorMessage: string
  ): Observable<AnamnesisRecord> {
    this.savingSubject.next(true);
    this.errorSubject.next(null);

    const method = exists ? "put" : "post";
    const url = `${this.apiUrl}/children/${childId}/anamnesis/${routeSegment}`;

    const request$ =
      method === "put"
        ? this.http.put<SuccessResponse<AnamnesisRecord>>(url, payload)
        : this.http.post<SuccessResponse<AnamnesisRecord>>(url, payload);

    return request$.pipe(
      map((res) => res.data),
      tap((updated) => this.anamnesisSubject.next(updated)),
      catchError((err) => {
        this.errorSubject.next(errorMessage);
        return throwError(() => err);
      }),
      finalize(() => this.savingSubject.next(false))
    );
  }

  private deleteSection(childId: string, sectionKey: AnamnesisSectionKey, errorMessage: string): Observable<void> {
    this.savingSubject.next(true);
    this.errorSubject.next(null);

    const routeSegment = this.sectionKeyToRouteSegment(sectionKey);
    const url = `${this.apiUrl}/children/${childId}/anamnesis/${routeSegment}`;

    return this.http.delete<SuccessResponse<null>>(url).pipe(
      map(() => undefined),
      tap(() => this.removeSectionFromLocalState(sectionKey)),
      catchError((err) => {
        this.errorSubject.next(errorMessage);
        return throwError(() => err);
      }),
      finalize(() => this.savingSubject.next(false))
    );
  }

  private removeSectionFromLocalState(sectionKey: AnamnesisSectionKey): void {
    const current = this.anamnesisSubject.value;
    if (!current) return;

    this.anamnesisSubject.next({
      ...current,
      [sectionKey]: null,
    });
  }

  private sectionKeyToRouteSegment(sectionKey: AnamnesisSectionKey): string {
    switch (sectionKey) {
      case "birth":
        return "birth";
      case "motorDevelopment":
        return "motor-development";
      case "languageCommunication":
        return "language-communication";
      case "health":
        return "health";
      case "behavior":
        return "behavior";
      case "routine":
        return "routine";
      default: {
        const _exhaustive: never = sectionKey;
        return _exhaustive;
      }
    }
  }
}
