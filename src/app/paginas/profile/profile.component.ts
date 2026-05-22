import { Component, OnInit } from "@angular/core";
import { AuthService } from "../../services/auth.service";
import { ChildService } from "../../services/child.service";
import { UserService } from "../../services/user.service";
import type { CreateChildDTO } from "../../api/interfaces/child.interface";
import type { UpdateUserDTO } from "../../api/interfaces/user.interface";
import { switchMap, take } from "rxjs";

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

  editMode = false;
  showCreateChild = false;
  flashMessage: string | null = null;


  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly childService: ChildService
  ) {
  }

  ngOnInit(): void {
    // Children list is profile-specific and not restored automatically.
    this.childService.loadMyChildren({ page: 1, pageSize: 50 }).pipe(take(1)).subscribe();
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
          this.flashMessage = "Profile updated.";
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
        this.flashMessage = "Child created.";
      },
      error: () => {
        // Service exposes a user-friendly error message.
      },
    });
  }
}

