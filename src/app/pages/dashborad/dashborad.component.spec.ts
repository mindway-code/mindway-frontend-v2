import { CommonModule } from "@angular/common";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterModule } from "@angular/router";
import { of } from "rxjs";
import { AuthService } from "../../services/auth.service";
import { DashboradComponent } from "./dashborad.component";

describe("DashboradComponent", () => {
  let component: DashboradComponent;
  let fixture: ComponentFixture<DashboradComponent>;

  beforeEach(async () => {
    const authServiceMock = {
      currentUser$: of({
        id: "user-1",
        name: "Usuário Teste",
        email: "usuario@teste.com",
        role: "common",
      }),
    };

    await TestBed.configureTestingModule({
      declarations: [DashboradComponent],
      imports: [CommonModule, RouterModule.forRoot([])],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboradComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
