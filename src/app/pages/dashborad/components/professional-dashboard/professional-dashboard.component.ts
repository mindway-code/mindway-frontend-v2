import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import type { ChildRecord } from '../../../../api/interfaces/child.interface';
import type { DashboardViewModel, RoleDashboardConfig } from '../../dashboard.models';

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

  readonly config: RoleDashboardConfig = {
    icon: 'bi-person-workspace',
    searchPlaceholder: 'Buscar criança acompanhada',
    summaryLabel: 'Perfis acompanhados',
    summaryDescription: 'Crianças que autorizaram sua participação na rede.',
    listEyebrow: 'Atuação colaborativa',
    listTitle: 'Crianças acompanhadas',
    listDescription: 'Consulte o contexto antes de registrar uma observação profissional.',
    emptyTitle: 'Nenhuma criança vinculada',
    emptyDescription: 'Os perfis compartilhados com você aparecerão neste espaço.',
    childActionLabel: 'Criar registro',
    childActionRoute: '/reports-child',
  };
}
