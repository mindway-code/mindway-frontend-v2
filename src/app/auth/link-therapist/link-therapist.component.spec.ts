import { CommonModule } from "@angular/common";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { of } from "rxjs";
import { AuthService } from "../../services/auth.service";
import { LinkTherapistComponent } from "./link-therapist.component";

describe("LinkTherapistComponent", () => {
  let component: LinkTherapistComponent;
  let fixture: ComponentFixture<LinkTherapistComponent>;

  beforeEach(async () => {
    const authServiceMock = {
      loading$: of(false),
      error$: of(null),
      register: jasmine.createSpy("register").and.returnValue(of("")),
      loadCurrentUser: jasmine.createSpy("loadCurrentUser").and.returnValue(of(null)),
    };

    await TestBed.configureTestingModule({
      declarations: [LinkTherapistComponent],
      imports: [CommonModule, ReactiveFormsModule, RouterModule.forRoot([])],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(LinkTherapistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
