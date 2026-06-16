import { CommonModule } from "@angular/common";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { of } from "rxjs";
import { AuthService } from "../../services/auth.service";
import { LinkClinicComponent } from "./link-clinic.component";

describe("LinkClinicComponent", () => {
  let component: LinkClinicComponent;
  let fixture: ComponentFixture<LinkClinicComponent>;

  beforeEach(async () => {
    const authServiceMock = {
      loading$: of(false),
      error$: of(null),
      register: jasmine.createSpy("register").and.returnValue(of("")),
      loadCurrentUser: jasmine.createSpy("loadCurrentUser").and.returnValue(of(null)),
    };

    await TestBed.configureTestingModule({
      declarations: [LinkClinicComponent],
      imports: [CommonModule, ReactiveFormsModule, RouterModule.forRoot([])],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(LinkClinicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
