import { Component } from "@angular/core";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: 'app-dashboard-layout',
  standalone: false,
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.css'
})
export class DashboardLayoutComponent {
  readonly currentUser$ = this.authService.currentUser$;

  constructor(private readonly authService: AuthService) {}
}
