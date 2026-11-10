import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import type { ChildRecord } from '../../../../api/interfaces/child.interface';

@Component({
  selector: 'app-reports-child-selector',
  standalone: false,
  templateUrl: './reports-child-selector.component.html',
  styleUrl: './reports-child-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsChildSelectorComponent {
  @Input() children: ChildRecord[] = [];
  @Input() selectedChildId: string | null = null;
  @Input() loading = false;
  @Output() selectedChildIdChange = new EventEmitter<string>();
  searchTerm = '';

  get selectedChild(): ChildRecord | null {
    return this.children.find((child) => child.id === this.selectedChildId) ?? null;
  }

  get filteredChildren(): ChildRecord[] {
    const search = this.searchTerm.trim().toLocaleLowerCase('pt-BR');
    if (!search) return this.children;

    const filtered = this.children.filter((child) =>
      child.name.toLocaleLowerCase('pt-BR').includes(search),
    );
    const selected = this.selectedChild;
    return selected && !filtered.some((child) => child.id === selected.id)
      ? [selected, ...filtered]
      : filtered;
  }

  updateSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
  }

  selectChild(event: Event): void {
    const childId = (event.target as HTMLSelectElement).value;
    if (childId) this.selectedChildIdChange.emit(childId);
  }

  getInitial(child: ChildRecord): string {
    return child.name.trim().charAt(0).toUpperCase() || 'C';
  }

  getPhoto(child: ChildRecord): string | null {
    const data = child as ChildRecord & Record<string, unknown>;
    const photo = data['photoUrl'] ?? data['avatarUrl'] ?? data['imageUrl'] ?? data['photo'];
    if (typeof photo === 'string' && photo.trim()) return photo;
    if (typeof localStorage === 'undefined') return null;

    try {
      const saved = localStorage.getItem(`mindway-child-profile-${child.id}`);
      const profile = saved ? (JSON.parse(saved) as Record<string, unknown>) : null;
      const savedPhoto = profile?.['photo'] ?? profile?.['photoUrl'];
      return typeof savedPhoto === 'string' && savedPhoto.trim() ? savedPhoto : null;
    } catch {
      return null;
    }
  }

  trackById(_index: number, child: ChildRecord): string {
    return child.id;
  }
}
