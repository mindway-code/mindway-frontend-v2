import { Component, EventEmitter, Input, Output } from "@angular/core";
import type { ChildRecord } from "../../../../api/interfaces/child.interface";

@Component({
  selector: "app-child-profile-card",
  standalone: false,
  templateUrl: "./child-card.component.html",
  styleUrl: "./child-card.component.scss",
})
export class ChildProfileCardComponent {
  @Input({ required: true }) child!: ChildRecord;
  @Input() active = false;

  @Output() selectChild = new EventEmitter<ChildRecord>();
}
