import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import type { ChildRecord } from '../../../../api/interfaces/child.interface';
import {
  getChildAge,
  getChildDiagnoses,
  getChildInitial,
  getChildName,
  getChildPhoto,
} from '../../dashboard-child.utils';
import type { DashboardViewModel, RoleDashboardConfig } from '../../dashboard.models';

@Component({
  selector: 'app-role-dashboard-shell',
  standalone: false,
  templateUrl: './role-dashboard-shell.component.html',
  styleUrl: './role-dashboard-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleDashboardShellComponent {
  @Input({ required: true }) viewModel!: DashboardViewModel;
  @Input({ required: true }) config!: RoleDashboardConfig;
  @Input({ required: true }) children: ChildRecord[] = [];
  @Input() loading = false;

  searchTerm = '';

  readonly today = new Date();
  readonly getAge = getChildAge;
  readonly getDiagnoses = getChildDiagnoses;
  readonly getInitial = getChildInitial;
  readonly getName = getChildName;
  readonly getPhoto = getChildPhoto;

  get firstName(): string {
    return this.viewModel.displayName.split(/\s+/)[0] || this.viewModel.roleLabel;
  }

  get profileInitial(): string {
    return this.firstName.charAt(0).toUpperCase();
  }

  get filteredChildren(): ChildRecord[] {
    const search = this.normalize(this.searchTerm);
    if (!search) return this.children;

    return this.children.filter((child) =>
      this.normalize(`${getChildName(child)} ${getChildDiagnoses(child)}`).includes(search),
    );
  }

  updateSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
  }

  clearSearch(): void {
    this.searchTerm = '';
  }

  trackChildById(_index: number, child: ChildRecord): string {
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
