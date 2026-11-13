import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import type { ChildRecord } from '../../../../api/interfaces/child.interface';
import { getChildInitial, getChildPhoto } from '../../dashboard-child.utils';
import type { DashboardViewModel } from '../../dashboard.models';

@Component({
  selector: 'app-family-dashboard',
  standalone: false,
  templateUrl: './family-dashboard.component.html',
  styleUrl: './family-dashboard.redesign.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FamilyDashboardComponent implements OnChanges {
  @Input({ required: true }) viewModel!: DashboardViewModel;
  @Input({ required: true }) children: ChildRecord[] = [];
  @Input() loading = false;

  profilePhoto: string | null = null;
  readonly today = new Date();
  selectedDay = new Date();
  activeDailyTipIndex = 0;

  readonly dailyTips = [
    'Estabeleça uma rotina visual com horários e atividades. Isso traz mais segurança e previsibilidade.',
    'Reserve alguns minutos para conversar sobre o dia. Escutar com calma ajuda a reconhecer conquistas e dificuldades.',
    'Registre observações com data e contexto para facilitar a troca de informações com a rede de apoio.',
  ];

  readonly guidanceCards = [
    {
      icon: 'bi-moon-stars',
      title: 'Qualidade do sono',
      description: 'Uma rotina de sono consistente ajuda no humor e na aprendizagem.',
      category: 'Rotina',
    },
    {
      icon: 'bi-apple',
      title: 'Alimentação e atenção',
      description: 'Refeições equilibradas apoiam o bem-estar ao longo do dia.',
      category: 'Saúde',
    },
    {
      icon: 'bi-stars',
      title: 'Pequenas conquistas',
      description: 'Reconheça cada avanço com palavras específicas e acolhedoras.',
      category: 'Comportamento',
    },
    {
      icon: 'bi-chat-heart',
      title: 'Conversas com calma',
      description: 'Perguntas abertas dão espaço para a criança contar como foi o dia.',
      category: 'Convivência',
    },
    {
      icon: 'bi-calendar-check',
      title: 'Rotina visível',
      description: 'Combine os próximos passos do dia com imagens ou palavras simples.',
      category: 'Rotina',
    },
    {
      icon: 'bi-journal-text',
      title: 'Registros úteis',
      description: 'Anote o que aconteceu, quando e em qual situação.',
      category: 'Acompanhamento',
    },
  ];

  readonly getInitial = getChildInitial;
  readonly getPhoto = getChildPhoto;

  get weekDays(): Date[] {
    const monday = new Date(this.selectedDay);
    const dayOfWeek = (monday.getDay() + 6) % 7;
    monday.setDate(monday.getDate() - dayOfWeek);
    monday.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return date;
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

  selectDay(day: Date): void {
    this.selectedDay = new Date(day);
  }

  stepWeek(direction: -1 | 1): void {
    const date = new Date(this.selectedDay);
    date.setDate(date.getDate() + direction * 7);
    this.selectedDay = date;
  }

  isSelectedDay(day: Date): boolean {
    return day.toDateString() === this.selectedDay.toDateString();
  }

  trackChildById(_index: number, child: ChildRecord): string {
    return child.id;
  }

  private loadProfilePhoto(): void {
    const storageKey = this.viewModel?.userId
      ? `mindway-account-photo-${this.viewModel.userId}`
      : null;
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
}
