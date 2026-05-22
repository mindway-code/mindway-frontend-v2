import { Component, ViewEncapsulation } from "@angular/core";
import { AuthService } from "../../servicos/auth.service";

@Component({
  selector: 'app-dashboard-layout',
  standalone: false,
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class DashboardLayoutComponent {

  readonly currentUser$ = this.authService.currentUser$;

  constructor(
    private readonly authService: AuthService
  ) {}

}