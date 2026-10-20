import { Component, Input } from "@angular/core";
import type { ChildRecord } from "../../../../api/interfaces/child.interface";

@Component({
  selector: "app-child-card",
  standalone: false,
  templateUrl: "./child-card.component.html",
  styleUrl: "./child-card.component.css",
})
export class ChildCardComponent {
  @Input() child!: ChildRecord;

  get profilePhoto(): string | null {
    const data = this.child as any;
    const photo = data?.photoUrl ?? data?.avatarUrl ?? data?.imageUrl ?? data?.photo;
    if (typeof photo === "string" && photo.trim()) return photo;
    if (!this.child?.id || typeof localStorage === "undefined") return null;
    try {
      const saved = localStorage.getItem(`mindway-child-profile-${this.child.id}`);
      const profile = saved ? JSON.parse(saved) : null;
      const savedPhoto = profile?.photo ?? profile?.photoUrl;
      return typeof savedPhoto === "string" && savedPhoto.trim() ? savedPhoto : null;
    } catch {
      return null;
    }
  }

  get birthDateLabel(): string {
    const raw = this.child?.birthDate;
    if (!raw) return "—";
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return String(raw);
    return date.toLocaleDateString();
  }

  get createdAtLabel(): string {
    const raw = this.child?.createdAt;
    if (!raw) return "—";
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return String(raw);
    return date.toLocaleDateString();
  }
}

