import { Component, Input } from "@angular/core";
import type { UserRecord } from "../../../../api/interfaces/user.interface";

@Component({
  selector: "app-profile-summary-card",
  standalone: false,
  templateUrl: "./profile-summary-card.component.html",
  styleUrl: "./profile-summary-card.component.css",
})
export class ProfileSummaryCardComponent {
  @Input() user: UserRecord | null = null;
}

