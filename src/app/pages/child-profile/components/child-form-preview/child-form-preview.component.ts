import { Component, EventEmitter, Input, Output } from '@angular/core';

interface ChildFormPreviewField {
  label: string;
  value: string;
  icon: string;
}

interface ChildFormPreviewMedication {
  name: string;
  concentration: string;
  dosage: string;
  schedule: string;
  route: string;
  notes: string;
}

interface ChildFormPreviewProvider {
  type: string;
  clinic: string;
  clinicPhone: string;
  professional: string;
  specialty: string;
  frequency: string;
  schedule: string;
  notes: string;
}

interface ChildFormPreviewRoutineActivity {
  time: string;
  activity: string;
}

interface ChildFormPreviewWeekDay {
  key: string;
  label: string;
}

interface ChildFormPreviewRoutineDay {
  label: string;
  activities: readonly ChildFormPreviewRoutineActivity[];
}

@Component({
  selector: 'app-child-form-preview',
  standalone: false,
  templateUrl: './child-form-preview.component.html',
  styleUrl: './child-form-preview.component.scss',
})
export class ChildFormPreviewComponent {
  @Input() activeSection = 0;
  @Input() name = '';
  @Input() birthDate = '';
  @Input() gender = '';
  @Input() accessCode = '';
  @Input() observations = '';
  @Input() sectionData: Record<string, string> = {};
  @Input() medications: readonly ChildFormPreviewMedication[] = [];
  @Input() careProviders: readonly ChildFormPreviewProvider[] = [];
  @Input() weekRoutine: Record<string, ChildFormPreviewRoutineActivity[]> = {};
  @Input() weekDays: readonly ChildFormPreviewWeekDay[] = [];
  @Input() editable = true;

  @Output() readonly editRequested = new EventEmitter<void>();

  get displayName(): string {
    return this.displayValue(this.name);
  }

  get displayBirthDate(): string {
    return this.displayValue(this.birthDate);
  }

  get displayGender(): string {
    return this.displayValue(this.gender);
  }

  get displayAccessCode(): string {
    return this.displayValue(this.accessCode);
  }

  get displayObservations(): string {
    return this.observationValue.trim() || 'Nenhuma observação adicional informada.';
  }

  get sectionTitle(): string {
    const titles = [
      'Informações básicas da criança',
      'Diagnósticos',
      'Saúde',
      'Clínica e terapias',
      'Escola',
      'Rotina e interesses',
      'Observações',
    ];
    return titles[this.activeSection] ?? 'Perfil da criança';
  }

  get sectionDisplayTitle(): string {
    const titles = [
      'Informações básicas',
      'Diagnósticos',
      'Saúde',
      'Clínica e terapias',
      'Escola',
      'Rotina e interesses',
      'Observações',
    ];
    return titles[this.activeSection] ?? 'Perfil da criança';
  }

  get sectionSubtitle(): string {
    const subtitles = [
      'Dados principais da criança.',
      'Informações sobre diagnósticos e acompanhamento.',
      'Cuidados, condições e medicamentos em uso.',
      'Profissionais e serviços da rede de cuidado.',
      'Informações sobre a vida escolar da criança.',
      'Atividades, preferências e organização semanal.',
      'Anotações importantes sobre a criança.',
    ];
    return subtitles[this.activeSection] ?? 'Informações do perfil da criança.';
  }

  get sectionIcon(): string {
    const icons = [
      'bi-person-vcard',
      'bi-clipboard2-pulse',
      'bi-heart-pulse',
      'bi-people',
      'bi-mortarboard',
      'bi-calendar2-week',
      'bi-card-text',
    ];
    return icons[this.activeSection] ?? 'bi-person';
  }

  get editButtonLabel(): string {
    return `Editar ${this.sectionTitle.toLocaleLowerCase('pt-BR')}`;
  }

  get previewFields(): ChildFormPreviewField[] {
    const fieldsBySection: Record<number, Array<[string, string, string]>> = {
      0: [
        ['Nome completo', this.displayName, 'bi-person'],
        ['Data de nascimento', this.displayBirthDate, 'bi-calendar3'],
        ['Gênero', this.displayGender, 'bi-gender-ambiguous'],
        ...(this.accessCode
          ? ([['Código de acesso', this.displayAccessCode, 'bi-key']] as Array<
              [string, string, string]
            >)
          : []),
      ],
      1: [
        [
          'Diagnóstico principal',
          this.getSectionValue('Diagn\u00f3stico principal'),
          'bi-clipboard2-pulse',
        ],
        [
          'Diagnósticos adicionais',
          this.getSectionValue('Diagn\u00f3sticos adicionais'),
          'bi-journal-medical',
        ],
        ['Data do diagnóstico', this.formattedDiagnosisDate, 'bi-calendar-check'],
        [
          'Profissional responsável',
          this.getSectionValue('Profissional que fez o diagn\u00f3stico'),
          'bi-person-badge',
        ],
      ],
      2: [
        ['Alergias', this.getSectionValue('Alergias'), 'bi-shield-exclamation'],
        [
          'Condições de saúde',
          this.getSectionValue('Condi\u00e7\u00f5es de sa\u00fade'),
          'bi-heart-pulse',
        ],
        ['Restrições', this.getSectionValue('Restri\u00e7\u00f5es'), 'bi-slash-circle'],
      ],
      3: [['Acompanhamentos cadastrados', String(this.displayCareProviders.length), 'bi-people']],
      4: [
        ['Nome da escola', this.getSectionValue('Nome da escola'), 'bi-building'],
        ['Série/ano', this.getSectionValue('S\u00e9rie/ano'), 'bi-book'],
        ['Turma', this.getSectionValue('Turma'), 'bi-people'],
        ['Professora', this.getSectionValue('Professora'), 'bi-person-workspace'],
        ['Coordenação', this.getSectionValue('Coordena\u00e7\u00e3o'), 'bi-person-badge'],
        ['Contato', this.getSectionValue('Contato'), 'bi-telephone'],
      ],
      5: [
        ['Atividades favoritas', this.getSectionValue('Atividades favoritas'), 'bi-stars'],
        ['Interesses', this.getSectionValue('Interesses'), 'bi-lightbulb'],
        ['Preferências', this.getSectionValue('Prefer\u00eancias'), 'bi-heart'],
      ],
      6: [],
    };

    return (fieldsBySection[this.activeSection] ?? []).map(([label, value, icon]) => ({
      label,
      value: this.displayValue(value),
      icon,
    }));
  }

  get displayMedications(): readonly ChildFormPreviewMedication[] {
    return this.medications.filter((medication) =>
      Object.values(medication).some((value) => value.trim()),
    );
  }

  get displayCareProviders(): readonly ChildFormPreviewProvider[] {
    return this.careProviders.filter((provider) =>
      Object.values(provider).some((value) => value.trim()),
    );
  }

  get routineDays(): ChildFormPreviewRoutineDay[] {
    return this.weekDays
      .map(({ key, label }) => ({
        label,
        activities: (this.weekRoutine[key] ?? []).filter(
          ({ time, activity }) => time.trim() || activity.trim(),
        ),
      }))
      .filter(({ activities }) => activities.length > 0);
  }

  get observationTitle(): string {
    const titles: Record<number, string> = {
      0: 'Observações adicionais',
      1: 'Observações do diagnóstico',
      2: 'Observações gerais de saúde',
      4: 'Observações escolares',
      5: 'Observações sobre a rotina',
      6: 'Observações gerais',
    };
    return titles[this.activeSection] ?? 'Observações';
  }

  get hasObservationPanel(): boolean {
    return this.activeSection !== 3;
  }

  private get formattedDiagnosisDate(): string {
    const value = this.getSectionValue('Data do diagn\u00f3stico').trim();
    if (!value) return 'Não informado';

    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-BR');
  }

  private get observationValue(): string {
    const keys: Record<number, string> = {
      1: 'Observa\u00e7\u00f5es',
      2: 'Observa\u00e7\u00f5es',
      4: 'Observa\u00e7\u00f5es escolares',
      5: 'Observa\u00e7\u00f5es sobre a rotina',
      6: 'Observa\u00e7\u00f5es gerais',
    };
    return this.activeSection === 0
      ? this.observations
      : this.getSectionValue(keys[this.activeSection] ?? '');
  }

  private getSectionValue(key: string): string {
    return this.sectionData[key] ?? '';
  }

  private displayValue(value: string): string {
    return value.trim() || 'Não informado';
  }
}
