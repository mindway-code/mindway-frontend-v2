import { Component, OnInit } from "@angular/core";
import { take } from "rxjs";
import { AuthService } from "./services/auth.service";

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'mindway-frontend';

  constructor(private readonly authService: AuthService) {}

  ngOnInit(): void {
    // Best-effort auth restore for navbar/state on page reloads.
    this.authService.restoreSession().pipe(take(1)).subscribe();
  }
}
