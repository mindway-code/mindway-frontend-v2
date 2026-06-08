import { Component, DestroyRef, OnInit, inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { distinctUntilChanged, map, switchMap, take, tap } from "rxjs";
import { AssociationChildService } from "../../services/association-child.service";
import { ChildService } from "../../services/child.service";
import type { CreateAssociationChildDTO } from "../../api/interfaces/association-child.interface";
import type { ChildRecord } from "../../api/interfaces/child.interface";

@Component({
  selector: "app-child-profile",
  standalone: false,
  templateUrl: "./child-profile.component.html",
  styleUrls: ["./child-profile.component.scss"],
})
export class ChildProfileComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  readonly children$ = this.childService.children$;
  readonly selectedChild$ = this.childService.selectedChild$;
  readonly childrenLoading$ = this.childService.loading$;
  readonly childrenError$ = this.childService.error$;
  readonly associationLoading$ = this.associationChildService.loading$;
  readonly associationError$ = this.associationChildService.error$;

  readonly selectedChildId$ = this.selectedChild$.pipe(map((child) => child?.id ?? null));

  constructor(
    private readonly childService: ChildService,
    private readonly associationChildService: AssociationChildService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        map((params) => params.get("childId")),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((childId) => {
        const children = this.childService.getChildrenSnapshot();
        if (!children.length) return;

        this.applySelection(childId, children);
      });

    this.childService
      .loadAccessibleChildren({ page: 1, pageSize: 50 })
      .pipe(take(1))
      .subscribe({
        next: (children) => {
          this.applySelection(this.route.snapshot.queryParamMap.get("childId"), children);
        },
        error: () => {
          // Service already exposes a user-friendly error message.
        },
      });
  }

  onSelectChild(child: ChildRecord | null): void {
    this.childService.selectChild(child);
    this.syncRouteSelection(child?.id ?? null);
  }

  onAssociateByAccessCode(payload: CreateAssociationChildDTO): void {
    this.associationChildService
      .associateByAccessCode(payload)
      .pipe(
        switchMap((result) =>
          this.childService.loadAccessibleChildren({ page: 1, pageSize: 50 }).pipe(
            tap((children) => {
              const match = children.find((child) => child.id === result.child.id) ?? null;
              this.childService.selectChild(match);
              this.syncRouteSelection(match?.id ?? null);
            })
          )
        ),
        take(1)
      )
      .subscribe({
        next: () => {},
        error: () => {
          // Service already exposes a user-friendly error message.
        },
      });
  }

  onOpenAnamnesis(child: ChildRecord): void {
    this.router.navigate(["/anamnesis"], { queryParams: { childId: child.id } });
  }

  private applySelection(childId: string | null, children: ChildRecord[]): void {
    const normalized = childId?.trim() ?? "";
    if (normalized) {
      this.childService.selectChildById(normalized);
      return;
    }

    const currentSelected = this.childService.getSelectedChildSnapshot();
    if (currentSelected && children.some((child) => child.id === currentSelected.id)) {
      this.childService.selectChild(currentSelected);
      return;
    }

    this.childService.selectChild(null);
  }

  private syncRouteSelection(childId: string | null): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { childId: childId || null },
      queryParamsHandling: "merge",
      replaceUrl: true,
    });
  }
}
