import { Component, EventEmitter, Input, Output } from "@angular/core";

type EmptyVariant = "no-children" | "no-reports";

@Component({
  selector: "app-reports-child-empty-state",
  standalone: false,
  templateUrl: "./reports-child-empty-state.component.html",
  styleUrls: ["./reports-child-empty-state.component.scss"],
})
export class ReportsChildEmptyStateComponent {
  @Input() variant: EmptyVariant = "no-reports";
  @Output() create = new EventEmitter<void>();
}

