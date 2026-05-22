import { Component, EventEmitter, Input, Output } from "@angular/core";
import type { ChildRecord } from "../../../../api/interfaces/child.interface";

@Component({
  selector: "app-child-details-panel",
  standalone: false,
  templateUrl: "./child-details-panel.component.html",
  styleUrls: ["./child-details-panel.component.scss"],
})
export class ChildDetailsPanelComponent {
  @Input() child: ChildRecord | null = null;
  @Output() openAnamnesis = new EventEmitter<ChildRecord>();
}

