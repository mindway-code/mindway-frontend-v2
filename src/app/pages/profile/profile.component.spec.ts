import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { ProfileComponent } from './profile.component';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { ProfileSummaryCardComponent } from './components/profile-summary-card/profile-summary-card.component';
import { ProfileEditFormComponent } from './components/profile-edit-form/profile-edit-form.component';
import { PageSkeletonComponent } from '../../shared/page-skeleton/page-skeleton.component';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ProfileComponent,
        ProfileSummaryCardComponent,
        ProfileEditFormComponent,
        PageSkeletonComponent,
      ],
      imports: [CommonModule, ReactiveFormsModule, RouterTestingModule],
      providers: [
        {
          provide: AuthService,
          useValue: {
            currentUser$: of({ id: 'u1', name: 'Test', email: 'test@example.com', role: 'common' }),
            loading$: of(false),
            error$: of(null),
            loadCurrentUser: () =>
              of({ id: 'u1', name: 'Test', email: 'test@example.com', role: 'common' }),
            logout: () => of(void 0),
          } satisfies Partial<AuthService>,
        },
        {
          provide: UserService,
          useValue: {
            saving$: of(false),
            error$: of(null),
            updateMe: () =>
              of({ id: 'u1', name: 'Test', email: 'test@example.com', role: 'common' }),
          } satisfies Partial<UserService>,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
