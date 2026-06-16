import { Component, OnInit } from "@angular/core";
import { AuthService } from "../../services/auth.service";
import { AssociationChildService } from "../../services/association-child.service";
import { ChildService } from "../../services/child.service";
import { UserService } from "../../services/user.service";
import type { CreateAssociationChildDTO } from "../../api/interfaces/association-child.interface";
import type { CreateChildDTO } from "../../api/interfaces/child.interface";
import type { UpdateUserDTO } from "../../api/interfaces/user.interface";
import { switchMap, take } from "rxjs";

interface InviteLink {
  label: string;
  description: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  readonly user$ = this.authService.currentUser$;
  readonly userLoading$ = this.authService.loading$;
  readonly userError$ = this.authService.error$;
  readonly profileSaving$ = this.userService.saving$;
  readonly profileError$ = this.userService.error$;

  readonly children$ = this.childService.children$;
  readonly childrenLoading$ = this.childService.loading$;
  readonly childrenSaving$ = this.childService.saving$;
  readonly childrenError$ = this.childService.error$;
  readonly associationLoading$ = this.associationChildService.loading$;
  readonly associationError$ = this.associationChildService.error$;

  readonly inviteLinks: InviteLink[] = [
    {
      label: "Escola",
      description: "Convide uma escola para criar acesso institucional.",
      path: "/link-school",
      icon: "bi-building-add",
    },
    {
      label: "Clínica",
      description: "Convide uma clínica para organizar acompanhamentos.",
      path: "/link-clinic",
      icon: "bi-hospital",
    },
    {
      label: "Terapeuta",
      description: "Convide terapeutas para colaborar nos registros.",
      path: "/link-therapist",
      icon: "bi-person-badge",
    },
    {
      label: "Profissional",
      description: "Convide professores, fisioterapeutas e áreas relacionadas.",
      path: "/link-professional",
      icon: "bi-clipboard2-pulse",
    },
    {
      label: "Responsável",
      description: "Convide familiares ou cuidadores para criar uma conta.",
      path: "/register",
      icon: "bi-person-heart",
    },
  ];

  editMode = false;
  showCreateChild = false;
  flashMessage: string | null = null;


  constructor(
    private readonly authService: AuthService,
    private readonly associationChildService: AssociationChildService,
    private readonly userService: UserService,
    private readonly childService: ChildService
  ) {
  }

  ngOnInit(): void {
    // Children list is profile-specific and not restored automatically.
    this.childService.loadAccessibleChildren({ page: 1, pageSize: 50 }).pipe(take(1)).subscribe();
  }

  startEdit(): void {
    this.editMode = true;
    this.flashMessage = null;
  }

  cancelEdit(): void {
    this.editMode = false;
  }

  saveProfile(payload: UpdateUserDTO): void {
    this.flashMessage = null;

    this.userService
      .updateMe(payload)
      .pipe(
        switchMap(() => this.authService.loadCurrentUser()),
        take(1)
      )
      .subscribe({
        next: () => {
          this.editMode = false;
          this.flashMessage = "Perfil atualizado.";
        },
        error: () => {
          // Service exposes a user-friendly error message.
        },
      });
  }

  toggleCreateChild(): void {
    this.showCreateChild = !this.showCreateChild;
    this.flashMessage = null;
  }

  closeCreateChild(): void {
    this.showCreateChild = false;
  }

  createChild(payload: CreateChildDTO): void {
    this.flashMessage = null;

    this.childService.createChild(payload).pipe(take(1)).subscribe({
      next: () => {
        this.showCreateChild = false;
        this.flashMessage = "Criança criada.";
      },
      error: () => {
        // Service exposes a user-friendly error message.
      },
    });
  }

  associateChild(payload: CreateAssociationChildDTO): void {
    this.flashMessage = null;

    this.associationChildService
      .associateByAccessCode(payload)
      .pipe(
        switchMap(() => this.childService.loadAccessibleChildren({ page: 1, pageSize: 50 })),
        take(1)
      )
      .subscribe({
        next: () => {
          this.flashMessage = "Criança conectada.";
        },
        error: () => {
          // Service exposes a user-friendly error message.
        },
      });
  }

  getInviteUrl(path: string): string {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}${path}`;
  }

  copyInviteLink(path: string): void {
    const url = this.getInviteUrl(path);
    void navigator.clipboard?.writeText(url);
    this.flashMessage = "Link de convite copiado.";
  }
}
