import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { DashboardLayoutComponent } from './dashboard-layout.component';
import { AuthService } from '../../services/auth.service';

describe('DashboardLayoutComponent', () => {
  let component: DashboardLayoutComponent;
  let fixture: ComponentFixture<DashboardLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardLayoutComponent],
      imports: [CommonModule, RouterTestingModule],
      providers: [
        {
          provide: AuthService,
          useValue: {
            currentUser$: of(null),
          } satisfies Partial<AuthService>,
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
