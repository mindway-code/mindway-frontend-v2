import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ChildService } from '../../services/child.service';
import { DashboradComponent } from './dashborad.component';

describe('DashboradComponent', () => {
  let component: DashboradComponent;
  let fixture: ComponentFixture<DashboradComponent>;

  beforeEach(async () => {
    const authServiceMock = {
      currentUser$: of({
        id: 'user-1',
        name: 'Usuário Teste',
        email: 'usuario@teste.com',
        role: 'common',
      }),
    };
    const childServiceMock = {
      children$: of([]),
      loading$: of(false),
      loadAccessibleChildren: () => of([]),
    };

    await TestBed.configureTestingModule({
      declarations: [DashboradComponent],
      imports: [CommonModule, RouterModule.forRoot([])],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: ChildService, useValue: childServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboradComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
