import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import type { ChildRecord } from '../../../../api/interfaces/child.interface';
import type { DashboardViewModel, RoleDashboardConfig } from '../../dashboard.models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent {
  @Input({ required: true }) viewModel!: DashboardViewModel;
  @Input({ required: true }) children: ChildRecord[] = [];
  @Input() loading = false;

  readonly config: RoleDashboardConfig = {
    icon: 'bi-shield-check',
    searchPlaceholder: 'Buscar perfil por nome ou diagnóstico',
    summaryLabel: 'Perfis acessíveis',
    summaryDescription: 'Visão limitada aos perfis liberados para sua conta.',
    listEyebrow: 'Visão administrativa',
    listTitle: 'Perfis e acessos',
    listDescription: 'Consulte um perfil para validar o fluxo e apoiar a rede de cuidado.',
    emptyTitle: 'Nenhum perfil disponível',
    emptyDescription: 'Os perfis autorizados para administração aparecerão aqui.',
    childActionLabel: 'Revisar perfil',
    childActionRoute: '/child-profile',
  };
}
