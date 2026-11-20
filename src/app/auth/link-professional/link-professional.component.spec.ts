import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth.service';

import { LinkProfessionalComponent } from './link-professional.component';

describe('LinkProfessionalComponent', () => {
  let component: LinkProfessionalComponent;
  let fixture: ComponentFixture<LinkProfessionalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LinkProfessionalComponent],
      imports: [CommonModule, ReactiveFormsModule, RouterModule.forRoot([])],
      providers: [
        {
          provide: AuthService,
          useValue: {
            loading$: of(false),
            error$: of(null),
            register: () => of('token'),
            loadCurrentUser: () => of(null),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LinkProfessionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
