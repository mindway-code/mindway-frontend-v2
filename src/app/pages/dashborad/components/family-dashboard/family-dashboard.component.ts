import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import type { ChildRecord } from '../../../../api/interfaces/child.interface';
import {
  getChildAge,
  getChildDiagnoses,
  getChildInitial,
  getChildName,
  getChildPhoto,
} from '../../dashboard-child.utils';
import type { DashboardViewModel } from '../../dashboard.models';

@Component({
  selector: 'app-family-dashboard',
  standalone: false,
  templateUrl: './family-dashboard.component.html',
  styleUrl: './family-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FamilyDashboardComponent implements OnChanges {
  @Input({ required: true }) viewModel!: DashboardViewModel;
  @Input({ required: true }) children: ChildRecord[] = [];
  @Input() loading = false;

  searchTerm = '';
  profilePhoto: string | null = null;
  photoError: string | null = null;
  readonly today = new Date();

  readonly getName = getChildName;
  readonly getInitial = getChildInitial;
  readonly getPhoto = getChildPhoto;
  readonly getAge = getChildAge;
  readonly getDiagnoses = getChildDiagnoses;

  constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

  get filteredChildren(): ChildRecord[] {
    const search = this.normalizeSearchValue(this.searchTerm);
    if (!search) return this.children;

    return this.children.filter((child) => {
      const searchableContent = `${this.getName(child)} ${this.getDiagnoses(child)}`;
      return this.normalizeSearchValue(searchableContent).includes(search);
    });
  }

  get profileInitial(): string {
    return this.viewModel.displayName.trim().charAt(0).toUpperCase() || 'R';
  }

  get firstName(): string {
    return this.viewModel.displayName.trim().split(/\s+/)[0] || 'Responsável';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['viewModel']) this.loadProfilePhoto();
  }

  updateSearchTerm(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
  }

  clearSearch(): void {
    this.searchTerm = '';
  }

  onProfilePhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.photoError = null;
    if (!file.type.startsWith('image/')) {
      this.photoError = 'Selecione um arquivo de imagem.';
      return;
    }
    if (file.size > 2_000_000) {
      this.photoError = 'A imagem deve ter no máximo 2 MB.';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const photo = String(reader.result);
      const storageKey = this.profilePhotoStorageKey;

      try {
        if (storageKey) localStorage.setItem(storageKey, photo);
        this.profilePhoto = photo;
      } catch {
        this.photoError = 'Não foi possível salvar a foto neste dispositivo.';
      }

      this.changeDetectorRef.markForCheck();
    };
    reader.readAsDataURL(file);
  }

  trackChildById(_index: number, child: ChildRecord): string {
    return child.id;
  }

  private get profilePhotoStorageKey(): string | null {
    return this.viewModel?.userId ? `mindway-account-photo-${this.viewModel.userId}` : null;
  }

  private loadProfilePhoto(): void {
    const storageKey = this.profilePhotoStorageKey;
    if (!storageKey || typeof localStorage === 'undefined') {
      this.profilePhoto = null;
      return;
    }

    try {
      this.profilePhoto = localStorage.getItem(storageKey);
    } catch {
      this.profilePhoto = null;
    }
  }

  private normalizeSearchValue(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR')
      .trim();
  }
}
