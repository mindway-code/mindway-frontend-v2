import { Component, DestroyRef, OnInit, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { BehaviorSubject, combineLatest, distinctUntilChanged, filter, map, take, tap } from "rxjs";
import { AnamnesisService } from "../../services/anamnesis.service";
import { ChildService } from "../../services/child.service";
import type { ChildRecord } from "../../api/interfaces/child.interface";
import type { AnamnesisRecord, UpdateAnamnesisGeneralNotesDTO } from "../../api/interfaces/anamnesis.interface";
import type {
  UpsertAnamnesisBehaviorDTO,
  UpsertAnamnesisBirthDTO,
  UpsertAnamnesisHealthDTO,
  UpsertAnamnesisLanguageCommunicationDTO,
  UpsertAnamnesisMotorDevelopmentDTO,
  UpsertAnamnesisRoutineDTO,
} from "../../api/interfaces/anamnesis.interface";

@Component({
  selector: "app-anamnesis",
  standalone: false,
  templateUrl: "./anamnesis.component.html",
  styleUrls: ["./anamnesis.component.scss"],
})
export class AnamnesisComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly selectedChildIdSubject = new BehaviorSubject<string | null>(null);

  readonly children$ = this.childService.children$;
  readonly childrenLoading$ = this.childService.loading$;
  readonly childrenError$ = this.childService.error$;

  readonly anamnesis$ = this.anamnesisService.anamnesis$;
  readonly loading$ = this.anamnesisService.loading$;
  readonly saving$ = this.anamnesisService.saving$;
  readonly error$ = this.anamnesisService.error$;
  readonly selectedChild$ = combineLatest([this.children$, this.selectedChildIdSubject]).pipe(
    map(([children, childId]) => children.find((child) => child.id === childId) ?? null)
  );
  readonly overview$ = combineLatest([this.selectedChild$, this.anamnesis$]).pipe(
    map(([child, anamnesis]) => this.buildOverview(child, anamnesis))
  );

  selectedChildId: string | null = null;

  private anamnesisSnapshot: AnamnesisRecord | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly anamnesisService: AnamnesisService,
    private readonly childService: ChildService
  ) {}

  ngOnInit(): void {
    this.childService
      .loadAccessibleChildren({ page: 1, pageSize: 50 })
      .pipe(take(1))
      .subscribe({
        next: () => {
          if (this.selectedChildId) {
            this.childService.selectChildById(this.selectedChildId);
          }
        },
        error: () => {
          // Service already exposes a user-friendly error message.
        },
      });

    this.anamnesis$.pipe(tap((a) => (this.anamnesisSnapshot = a)), takeUntilDestroyed(this.destroyRef)).subscribe();

    this.route.queryParamMap
      .pipe(
        map((params) => params.get("childId")),
        filter((childId): childId is string => Boolean(childId)),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((childId) => this.onChildSelected(childId));
  }

  onChildSelected(childId: string): void {
    const normalized = childId?.trim() ?? "";
    if (!normalized) {
      this.selectedChildId = null;
      this.selectedChildIdSubject.next(null);
      this.childService.selectChild(null);
      this.anamnesisService.clearState();
      return;
    }

    this.selectedChildId = normalized;
    this.selectedChildIdSubject.next(normalized);
    this.childService.selectChildById(normalized);
    this.anamnesisService.clearState();
    this.anamnesisService.loadByChildId(normalized).subscribe();
  }

  onCreateAnamnesis(): void {
    if (!this.selectedChildId) return;
    this.anamnesisService.createAnamnesis(this.selectedChildId).subscribe();
  }

  onSaveBirth(payload: UpsertAnamnesisBirthDTO): void {
    if (!this.selectedChildId) return;
    this.anamnesisService.upsertBirth(this.selectedChildId, payload, Boolean(this.anamnesisSnapshot?.birth)).subscribe();
  }

  onDeleteBirth(): void {
    if (!this.selectedChildId) return;
    if (!confirm("Are you sure you want to delete the Birth section?")) return;
    this.anamnesisService.deleteBirth(this.selectedChildId).subscribe();
  }

  onSaveMotorDevelopment(payload: UpsertAnamnesisMotorDevelopmentDTO): void {
    if (!this.selectedChildId) return;
    this.anamnesisService
      .upsertMotorDevelopment(this.selectedChildId, payload, Boolean(this.anamnesisSnapshot?.motorDevelopment))
      .subscribe();
  }

  onDeleteMotorDevelopment(): void {
    if (!this.selectedChildId) return;
    if (!confirm("Are you sure you want to delete the Motor Development section?")) return;
    this.anamnesisService.deleteMotorDevelopment(this.selectedChildId).subscribe();
  }

  onSaveLanguageCommunication(payload: UpsertAnamnesisLanguageCommunicationDTO): void {
    if (!this.selectedChildId) return;
    this.anamnesisService
      .upsertLanguageCommunication(this.selectedChildId, payload, Boolean(this.anamnesisSnapshot?.languageCommunication))
      .subscribe();
  }

  onDeleteLanguageCommunication(): void {
    if (!this.selectedChildId) return;
    if (!confirm("Are you sure you want to delete the Language & Communication section?")) return;
    this.anamnesisService.deleteLanguageCommunication(this.selectedChildId).subscribe();
  }

  onSaveHealth(payload: UpsertAnamnesisHealthDTO): void {
    if (!this.selectedChildId) return;
    this.anamnesisService.upsertHealth(this.selectedChildId, payload, Boolean(this.anamnesisSnapshot?.health)).subscribe();
  }

  onDeleteHealth(): void {
    if (!this.selectedChildId) return;
    if (!confirm("Are you sure you want to delete the Health section?")) return;
    this.anamnesisService.deleteHealth(this.selectedChildId).subscribe();
  }

  onSaveBehavior(payload: UpsertAnamnesisBehaviorDTO): void {
    if (!this.selectedChildId) return;
    this.anamnesisService
      .upsertBehavior(this.selectedChildId, payload, Boolean(this.anamnesisSnapshot?.behavior))
      .subscribe();
  }

  onDeleteBehavior(): void {
    if (!this.selectedChildId) return;
    if (!confirm("Are you sure you want to delete the Behavior section?")) return;
    this.anamnesisService.deleteBehavior(this.selectedChildId).subscribe();
  }

  onSaveRoutine(payload: UpsertAnamnesisRoutineDTO): void {
    if (!this.selectedChildId) return;
    this.anamnesisService.upsertRoutine(this.selectedChildId, payload, Boolean(this.anamnesisSnapshot?.routine)).subscribe();
  }

  onDeleteRoutine(): void {
    if (!this.selectedChildId) return;
    if (!confirm("Are you sure you want to delete the Routine section?")) return;
    this.anamnesisService.deleteRoutine(this.selectedChildId).subscribe();
  }

  onSaveGeneralNotes(payload: UpdateAnamnesisGeneralNotesDTO): void {
    if (!this.selectedChildId) return;
    this.anamnesisService.updateGeneralNotes(this.selectedChildId, payload).subscribe();
  }

  private buildOverview(child: ChildRecord | null, anamnesis: AnamnesisRecord | null): {
    child: ChildRecord | null;
    completedSections: number;
    totalSections: number;
    hasAnamnesis: boolean;
  } {
    const totalSections = 7;
    if (!anamnesis) {
      return {
        child,
        completedSections: 0,
        totalSections,
        hasAnamnesis: false,
      };
    }

    const completedSections = [
      anamnesis.birth,
      anamnesis.motorDevelopment,
      anamnesis.languageCommunication,
      anamnesis.health,
      anamnesis.behavior,
      anamnesis.routine,
      anamnesis.generalNotes?.trim() ? true : null,
    ].filter(Boolean).length;

    return {
      child,
      completedSections,
      totalSections,
      hasAnamnesis: true,
    };
  }
}
