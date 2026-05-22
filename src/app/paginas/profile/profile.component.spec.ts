import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { ProfileComponent } from './profile.component';
import { AuthService } from '../../servicos/auth.service';
import { UserService } from '../../servicos/user.service';
import { ChildService } from '../../servicos/child.service';
import { ProfileSummaryCardComponent } from './components/profile-summary-card/profile-summary-card.component';
import { ProfileEditFormComponent } from './components/profile-edit-form/profile-edit-form.component';
import { ChildrenSectionComponent } from './components/children-section/children-section.component';
import { ChildCardComponent } from './components/child-card/child-card.component';
import { ChildCreateFormComponent } from './components/child-create-form/child-create-form.component';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ProfileComponent,
        ProfileSummaryCardComponent,
        ProfileEditFormComponent,
        ChildrenSectionComponent,
        ChildCardComponent,
        ChildCreateFormComponent,
      ],
      imports: [CommonModule, ReactiveFormsModule, RouterTestingModule],
      providers: [
        {
          provide: AuthService,
          useValue: {
            currentUser$: of({ id: 'u1', name: 'Test', email: 'test@example.com', role: 'common' }),
            loading$: of(false),
            error$: of(null),
            loadCurrentUser: () => of({ id: 'u1', name: 'Test', email: 'test@example.com', role: 'common' }),
          } satisfies Partial<AuthService>,
        },
        {
          provide: UserService,
          useValue: {
            saving$: of(false),
            error$: of(null),
            updateMe: () => of({ id: 'u1', name: 'Test', email: 'test@example.com', role: 'common' }),
          } satisfies Partial<UserService>,
        },
        {
          provide: ChildService,
          useValue: {
            children$: of([]),
            loading$: of(false),
            saving$: of(false),
            error$: of(null),
            loadMyChildren: () => of([]),
            createChild: () =>
              of({
                id: 'c1',
                responsibleId: 'u1',
                name: 'Child',
                age: 1,
                birthDate: '2020-01-01',
                accessCode: 'ABC123',
                createdAt: '2020-01-01',
                updatedAt: '2020-01-01',
              }),
          } satisfies Partial<ChildService>,
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

