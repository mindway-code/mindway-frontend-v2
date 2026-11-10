import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import type { ChildRecord } from '../../../../api/interfaces/child.interface';

@Component({
  selector: 'app-reports-child-selector',
  standalone: false,
  templateUrl: './reports-child-selector.component.html',
  styleUrl: './reports-child-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsChildSelectorComponent {
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  @Input() children: ChildRecord[] = [];
  @Input() selectedChildId: string | null = null;
  @Input() loading = false;
  @Output() selectedChildIdChange = new EventEmitter<string>();

  searchTerm = '';
  dialogOpen = false;

  get selectedChild(): ChildRecord | null {
    return this.children.find((child) => child.id === this.selectedChildId) ?? null;
  }

  get filteredChildren(): ChildRecord[] {
    const search = this.normalize(this.searchTerm);
    if (!search) return this.children;

    return this.children.filter((child) =>
      this.normalize(`${child.name} ${child.age} anos`).includes(search),
    );
  }

  openDialog(): void {
    if (this.loading || !this.children.length) return;
    this.searchTerm = '';
    this.dialogOpen = true;
    setTimeout(() => this.searchInput?.nativeElement.focus());
  }

  closeDialog(): void {
    this.dialogOpen = false;
    this.searchTerm = '';
  }

  updateSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
  }

  selectChild(child: ChildRecord): void {
    this.selectedChildIdChange.emit(child.id);
    this.closeDialog();
  }

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    if (this.dialogOpen) this.closeDialog();
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

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR')
      .trim();
  }
}
