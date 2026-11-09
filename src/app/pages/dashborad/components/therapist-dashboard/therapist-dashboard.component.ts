import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import type { ChildRecord } from '../../../../api/interfaces/child.interface';
import type { DashboardViewModel, RoleDashboardConfig } from '../../dashboard.models';

@Component({
  selector: 'app-therapist-dashboard',
  standalone: false,
  templateUrl: './therapist-dashboard.component.html',
  styleUrl: './therapist-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TherapistDashboardComponent {
  @Input({ required: true }) viewModel!: DashboardViewModel;
  @Input({ required: true }) children: ChildRecord[] = [];
  @Input() loading = false;

  readonly config: RoleDashboardConfig = {
    icon: 'bi-heart-pulse',
    searchPlaceholder: 'Buscar paciente por nome ou diagnóstico',
    summaryLabel: 'Pacientes vinculados',
    summaryDescription: 'Perfis com acompanhamento terapêutico autorizado.',
    listEyebrow: 'Acompanhamento clínico',
    listTitle: 'Pacientes',
    listDescription: 'Acesse o histórico e continue o acompanhamento do paciente selecionado.',
    emptyTitle: 'Nenhum paciente vinculado',
    emptyDescription: 'Os pacientes autorizados aparecerão quando o vínculo estiver ativo.',
    childActionLabel: 'Acompanhar',
    childActionRoute: '/reports-child',
  };
}
