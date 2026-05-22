import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { distinctUntilChanged, filter, map, tap } from "rxjs";
import { AnamnesisService } from "../../servicos/anamnesis.service";
import { ChildService } from "../../servicos/child.service";
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
  readonly children$ = this.childService.children$;
  readonly childrenLoading$ = this.childService.loading$;
  readonly childrenError$ = this.childService.error$;

  readonly anamnesis$ = this.anamnesisService.anamnesis$;
  readonly loading$ = this.anamnesisService.loading$;
  readonly saving$ = this.anamnesisService.saving$;
  readonly error$ = this.anamnesisService.error$;

  selectedChildId: string | null = null;

  private anamnesisSnapshot: AnamnesisRecord | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly anamnesisService: AnamnesisService,
    private readonly childService: ChildService
  ) {}

  ngOnInit(): void {
    this.childService.loadChildren().subscribe();

    this.anamnesis$.pipe(tap((a) => (this.anamnesisSnapshot = a)), takeUntilDestroyed()).subscribe();

    this.route.queryParamMap
      .pipe(
        map((params) => params.get("childId")),
        filter((childId): childId is string => Boolean(childId)),
        distinctUntilChanged(),
        takeUntilDestroyed()
      )
      .subscribe((childId) => this.onChildSelected(childId));
  }

  onChildSelected(childId: string): void {
    const normalized = childId?.trim() ?? "";
    if (!normalized) {
      this.selectedChildId = null;
      this.anamnesisService.clearState();
      return;
    }

    this.selectedChildId = normalized;
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
}

