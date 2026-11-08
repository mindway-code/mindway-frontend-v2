import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import type { ChildRecord } from '../../../../api/interfaces/child.interface';
import {
  getChildAge,
  getChildDiagnosisList,
  getChildGender,
  getChildInitial,
  getChildName,
} from '../../dashboard-child.utils';
import type { DashboardViewModel } from '../../dashboard.models';

@Component({
  selector: 'app-professional-dashboard',
  standalone: false,
  templateUrl: './professional-dashboard.component.html',
  styleUrl: './professional-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfessionalDashboardComponent {
  @Input({ required: true }) viewModel!: DashboardViewModel;
  @Input({ required: true }) children: ChildRecord[] = [];
  @Input() loading = false;

  readonly getName = getChildName;
  readonly getInitial = getChildInitial;
  readonly getAge = getChildAge;
  readonly getDiagnosisList = getChildDiagnosisList;
  readonly getGender = getChildGender;

  trackChildById(_index: number, child: ChildRecord): string {
    return child.id;
  }
}
