import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import type { ChildRecord } from '../../../../api/interfaces/child.interface';
import type { DashboardViewModel, RoleDashboardConfig } from '../../dashboard.models';

@Component({
  selector: 'app-institution-dashboard',
  standalone: false,
  templateUrl: './institution-dashboard.component.html',
  styleUrl: './institution-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstitutionDashboardComponent {
  @Input({ required: true }) viewModel!: DashboardViewModel;
  @Input({ required: true }) children: ChildRecord[] = [];
  @Input() loading = false;

  readonly config: RoleDashboardConfig = {
    icon: 'bi-buildings',
    searchPlaceholder: 'Buscar criança vinculada à instituição',
    summaryLabel: 'Perfis institucionais',
    summaryDescription: 'Crianças compartilhadas com a escola ou clínica.',
    listEyebrow: 'Rede institucional',
    listTitle: 'Acompanhamentos',
    listDescription: 'Centralize a consulta dos perfis acompanhados pela sua equipe.',
    emptyTitle: 'Nenhum acompanhamento ativo',
    emptyDescription: 'Os perfis compartilhados com a instituição aparecerão aqui.',
    childActionLabel: 'Ver acompanhamento',
    childActionRoute: '/child-profile',
  };
}
