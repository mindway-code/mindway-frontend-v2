import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
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

type AgeGroupFilter = 'early-childhood' | 'childhood' | 'adolescence';
type DiagnosisStatusFilter = 'all' | 'with-diagnosis' | 'without-diagnosis';

interface FamilyFilterState {
  ageGroups: AgeGroupFilter[];
  diagnosisStatus: DiagnosisStatusFilter;
  diagnosisQuery: string;
  minimumAge: number | null;
  maximumAge: number | null;
}

interface FilterBadge {
  key: string;
  label: string;
}

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
  filterDialogOpen = false;
  filterError: string | null = null;
  appliedFilters: FamilyFilterState = this.createEmptyFilters();
  draftFilters: FamilyFilterState = this.createEmptyFilters();
  profilePhoto: string | null = null;
  photoError: string | null = null;
  readonly today = new Date();

  readonly getName = getChildName;
  readonly getInitial = getChildInitial;
  readonly getPhoto = getChildPhoto;
  readonly getAge = getChildAge;
  readonly getDiagnoses = getChildDiagnoses;
  readonly ageGroupOptions: ReadonlyArray<{
    value: AgeGroupFilter;
    label: string;
    description: string;
  }> = [
    { value: 'early-childhood', label: '0 a 5 anos', description: 'Primeira infância' },
    { value: 'childhood', label: '6 a 11 anos', description: 'Infância' },
    { value: 'adolescence', label: '12 anos ou mais', description: 'Adolescência' },
  ];

  constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

  get filteredChildren(): ChildRecord[] {
    const search = this.normalizeSearchValue(this.searchTerm);
    return this.children.filter((child) => {
      const searchableContent = `${this.getName(child)} ${this.getDiagnoses(child)}`;
      const matchesSearch =
        !search || this.normalizeSearchValue(searchableContent).includes(search);
      return matchesSearch && this.matchesAppliedFilters(child);
    });
  }

  get activeFilterBadges(): FilterBadge[] {
    const badges: FilterBadge[] = this.appliedFilters.ageGroups.map((group) => ({
      key: `age:${group}`,
      label: this.ageGroupOptions.find((option) => option.value === group)?.label ?? group,
    }));

    if (this.appliedFilters.diagnosisStatus === 'with-diagnosis') {
      badges.push({ key: 'diagnosis-status', label: 'Com diagnóstico' });
    }
    if (this.appliedFilters.diagnosisStatus === 'without-diagnosis') {
      badges.push({ key: 'diagnosis-status', label: 'Sem diagnóstico' });
    }
    if (this.appliedFilters.diagnosisQuery) {
      badges.push({
        key: 'diagnosis-query',
        label: `Diagnóstico: ${this.appliedFilters.diagnosisQuery}`,
      });
    }
    if (this.appliedFilters.minimumAge !== null || this.appliedFilters.maximumAge !== null) {
      badges.push({ key: 'age-range', label: this.preciseAgeLabel });
    }

    return badges;
  }

  get activeFilterCount(): number {
    return this.activeFilterBadges.length;
  }

  get preciseAgeLabel(): string {
    const { minimumAge, maximumAge } = this.appliedFilters;
    if (minimumAge !== null && maximumAge !== null) return `${minimumAge} a ${maximumAge} anos`;
    if (minimumAge !== null) return `A partir de ${minimumAge} anos`;
    return `Até ${maximumAge} anos`;
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

  openFilterDialog(): void {
    this.draftFilters = this.cloneFilters(this.appliedFilters);
    this.filterError = null;
    this.filterDialogOpen = true;
  }

  closeFilterDialog(): void {
    this.filterDialogOpen = false;
    this.filterError = null;
  }

  toggleDraftAgeGroup(group: AgeGroupFilter): void {
    const isSelected = this.draftFilters.ageGroups.includes(group);
    this.draftFilters = {
      ...this.draftFilters,
      ageGroups: isSelected
        ? this.draftFilters.ageGroups.filter((item) => item !== group)
        : [...this.draftFilters.ageGroups, group],
    };
  }

  isDraftAgeGroupSelected(group: AgeGroupFilter): boolean {
    return this.draftFilters.ageGroups.includes(group);
  }

  setDraftDiagnosisStatus(status: DiagnosisStatusFilter): void {
    this.draftFilters = { ...this.draftFilters, diagnosisStatus: status };
  }

  updateDraftDiagnosisQuery(event: Event): void {
    this.draftFilters = {
      ...this.draftFilters,
      diagnosisQuery: (event.target as HTMLInputElement).value,
    };
  }

  updateDraftAge(event: Event, field: 'minimumAge' | 'maximumAge'): void {
    const value = (event.target as HTMLInputElement).value;
    this.draftFilters = {
      ...this.draftFilters,
      [field]: value === '' ? null : Number(value),
    };
    this.filterError = null;
  }

  applyFilters(): void {
    const { minimumAge, maximumAge } = this.draftFilters;
    if ((minimumAge !== null && minimumAge < 0) || (maximumAge !== null && maximumAge < 0)) {
      this.filterError = 'As idades não podem ser negativas.';
      return;
    }
    if (minimumAge !== null && maximumAge !== null && minimumAge > maximumAge) {
      this.filterError = 'A idade mínima não pode ser maior que a idade máxima.';
      return;
    }

    this.appliedFilters = {
      ...this.cloneFilters(this.draftFilters),
      diagnosisQuery: this.draftFilters.diagnosisQuery.trim(),
    };
    this.closeFilterDialog();
  }

  clearDraftFilters(): void {
    this.draftFilters = this.createEmptyFilters();
    this.filterError = null;
  }

  clearAllFilters(): void {
    this.appliedFilters = this.createEmptyFilters();
    if (this.filterDialogOpen) this.draftFilters = this.createEmptyFilters();
  }

  clearSearchAndFilters(): void {
    this.clearSearch();
    this.clearAllFilters();
  }

  removeFilter(key: string): void {
    if (key.startsWith('age:')) {
      const ageGroup = key.replace('age:', '') as AgeGroupFilter;
      this.appliedFilters = {
        ...this.appliedFilters,
        ageGroups: this.appliedFilters.ageGroups.filter((group) => group !== ageGroup),
      };
      return;
    }

    if (key === 'diagnosis-status') {
      this.appliedFilters = { ...this.appliedFilters, diagnosisStatus: 'all' };
      return;
    }
    if (key === 'diagnosis-query') {
      this.appliedFilters = { ...this.appliedFilters, diagnosisQuery: '' };
      return;
    }
    if (key === 'age-range') {
      this.appliedFilters = { ...this.appliedFilters, minimumAge: null, maximumAge: null };
    }
  }

  @HostListener('document:keydown.escape')
  closeFilterDialogOnEscape(): void {
    if (this.filterDialogOpen) this.closeFilterDialog();
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

  private matchesAppliedFilters(child: ChildRecord): boolean {
    const age = this.getNumericAge(child);
    const diagnoses = this.getDiagnoses(child);
    const hasDiagnosis = Boolean(diagnoses.trim());
    const { ageGroups, diagnosisStatus, diagnosisQuery, minimumAge, maximumAge } =
      this.appliedFilters;

    if (ageGroups.length && !ageGroups.some((group) => this.matchesAgeGroup(age, group))) {
      return false;
    }
    if (diagnosisStatus === 'with-diagnosis' && !hasDiagnosis) return false;
    if (diagnosisStatus === 'without-diagnosis' && hasDiagnosis) return false;
    if (
      diagnosisQuery &&
      !this.normalizeSearchValue(diagnoses).includes(this.normalizeSearchValue(diagnosisQuery))
    ) {
      return false;
    }
    if (minimumAge !== null && (age === null || age < minimumAge)) return false;
    if (maximumAge !== null && (age === null || age > maximumAge)) return false;

    return true;
  }

  private getNumericAge(child: ChildRecord): number | null {
    if (typeof child.age === 'number' && Number.isFinite(child.age)) return child.age;
    const match = this.getAge(child).match(/\d+/);
    return match ? Number(match[0]) : null;
  }

  private matchesAgeGroup(age: number | null, group: AgeGroupFilter): boolean {
    if (age === null) return false;
    if (group === 'early-childhood') return age <= 5;
    if (group === 'childhood') return age >= 6 && age <= 11;
    return age >= 12;
  }

  private createEmptyFilters(): FamilyFilterState {
    return {
      ageGroups: [],
      diagnosisStatus: 'all',
      diagnosisQuery: '',
      minimumAge: null,
      maximumAge: null,
    };
  }

  private cloneFilters(filters: FamilyFilterState): FamilyFilterState {
    return { ...filters, ageGroups: [...filters.ageGroups] };
  }

  private normalizeSearchValue(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR')
      .trim();
  }
}
