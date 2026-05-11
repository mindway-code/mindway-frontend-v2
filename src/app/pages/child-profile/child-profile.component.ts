import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { map, switchMap, take, tap } from "rxjs";
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
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.childService
      .loadAccessibleChildren({ page: 1, pageSize: 50 })
      .pipe(take(1))
      .subscribe({
        next: (children) => {
          if (children.length) this.childService.selectChild(children[0]);
        },
        error: () => {
          // Service already exposes a user-friendly error message.
        },
      });
  }

  onSelectChild(child: ChildRecord): void {
    this.childService.selectChild(child);
  }

  onAssociateByAccessCode(payload: CreateAssociationChildDTO): void {
    this.associationChildService
      .associateByAccessCode(payload)
      .pipe(
        switchMap((result) =>
          this.childService.loadAccessibleChildren({ page: 1, pageSize: 50 }).pipe(
            tap((children) => {
              const match = children.find((child) => child.id === result.child.id) ?? null;
              this.childService.selectChild(match ?? children[0] ?? null);
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
}
