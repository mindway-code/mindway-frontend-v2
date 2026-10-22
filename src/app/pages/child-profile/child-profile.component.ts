import {
  Component,
  DestroyRef,
  OnInit,
  inject,
} from "@angular/core";

import {
  ActivatedRoute,
  Router,
} from "@angular/router";

import {
  takeUntilDestroyed,
} from "@angular/core/rxjs-interop";

import {
  distinctUntilChanged,
  map,
  of,
  switchMap,
  take,
  tap,
} from "rxjs";
import type { Observable } from "rxjs";

import {
  AssociationChildService,
} from "../../services/association-child.service";

import {
  ChildService,
} from "../../services/child.service";
import { AuthService } from "../../services/auth.service";
import { AnamnesisService } from "../../services/anamnesis.service";

import type {
  CreateAssociationChildDTO,
} from "../../api/interfaces/association-child.interface";

import type {
  ChildRecord,
  CreateChildDTO,
} from "../../api/interfaces/child.interface";
import type { AnamnesisRecord, UpsertAnamnesisHealthDTO, UpsertAnamnesisRoutineDTO } from "../../api/interfaces/anamnesis.interface";

interface ChildCareProvider {
  type: string;
  clinic: string;
  clinicPhone: string;
  professional: string;
  specialty: string;
  frequency: string;
  schedule: string;
  notes: string;
}

interface RoutineActivity {
  time: string;
  activity: string;
}

interface ChildMedication {
  name: string;
  concentration: string;
  dosage: string;
  schedule: string;
  route: string;
  notes: string;
}

interface ProfileActivity {
  id: string;
  createdAt: string;
  section: string;
  action: string;
  details: string;
  actor: string;
  actorRole?: string;
  description?: string;
}

@Component({
  selector: "app-child-profile",
  standalone: false,
  templateUrl: "./child-profile.component.html",
  styleUrls: ["./child-profile.component.scss"],
})
export class ChildProfileComponent implements OnInit {

  private readonly destroyRef = inject(DestroyRef);

  readonly children$ = this.childService.children$;

  readonly selectedChild$ =
    this.childService.selectedChild$;

  readonly childrenLoading$ =
    this.childService.loading$;

  readonly childrenSaving$ =
    this.childService.saving$;

  readonly childrenError$ =
    this.childService.error$;

  readonly associationLoading$ =
    this.associationChildService.loading$;

  readonly associationError$ =
    this.associationChildService.error$;

  readonly selectedChildId$ =
    this.selectedChild$.pipe(
      map((child) => child?.id ?? null)
    );


  /**
   * Seções do perfil da criança.
   */
  readonly profileSections = [
    {
      title: "Informações básicas",
      icon: "👤",
      description: "Dados principais da criança.",
    },
    {
      title: "Diagnósticos",
      icon: "🧩",
      description: "Diagnósticos e informações relacionadas.",
    },
    {
      title: "Saúde",
      icon: "❤️",
      description: "Informações importantes de saúde.",
    },
    {
      title: "Clínica e terapias",
      icon: "🧩",
      description: "Clínicas, profissionais e terapias.",
    },
    {
      title: "Escola",
      icon: "🏫",
      description: "Informações escolares da criança.",
    },
    {
      title: "Rotina e interesses",
      icon: "📅",
      description: "Rotina, preferências e interesses.",
    },
    {
      title: "Observações",
      icon: "📝",
      description: "Outras informações importantes.",
    },
    {
      title: "Histórico de atividades",
      icon: "🕒",
      description: "Acompanhe as alterações registradas neste dispositivo.",
    },
  ];

  readonly visibleProfileSections = this.profileSections.slice(0, 7);


  /**
   * Seção atualmente selecionada.
   */
  activeSection = 0;
  previewMode = true;

  sectionFields: Record<number, string[]> = {
    1: ["Diagnóstico principal", "Diagnósticos adicionais", "Data do diagnóstico", "Profissional que fez o diagnóstico", "Observações"],
    2: ["Alergias", "Condições de saúde", "Restrições", "Observações"],
    3: ["Clínica", "Telefone da clínica", "Profissionais", "Especialidade", "Frequência", "Dias e horários", "Observações"],
    4: ["Nome da escola", "Série/ano", "Turma", "Professora", "Coordenação", "Contato", "Observações escolares"],
    5: ["Rotina", "Atividades favoritas", "Interesses", "Preferências", "Observações"],
    6: ["Observações gerais"],
  };

  readonly weekDays = [
    { key: "monday", label: "Segunda-feira" },
    { key: "tuesday", label: "Terça-feira" },
    { key: "wednesday", label: "Quarta-feira" },
    { key: "thursday", label: "Quinta-feira" },
    { key: "friday", label: "Sexta-feira" },
    { key: "saturday", label: "Sábado" },
    { key: "sunday", label: "Domingo" },
  ];
  readonly genderOptions = ["Feminino", "Masculino", "Não binário", "Outro", "Prefiro não informar"];

  sectionData: Record<number, Record<string, string>> = Array.from({ length: 8 }, () => ({}));
  childPhoto: string | null = null;
  careProviders: ChildCareProvider[] = [this.createCareProvider()];
  weekRoutine: Record<string, RoutineActivity[]> = this.createWeekRoutine();
  medicationEntries: ChildMedication[] = [];
  activityHistory: ProfileActivity[] = [];
  activityArea = "all";
  activityFrom = "";
  activityTo = "";
  activitySearch = "";
  activityPage = 1;
  readonly activityPageSize = 9;
  private hasLocalMedicationEntries = false;
  private currentUserName = "Usuário";
  private currentUserRole = "Usuário";
  savedMessage = "";
  private currentAnamnesis: AnamnesisRecord | null = null;
  showCreateChild = false;
  isProfessionalView = false;


  constructor(
    private readonly childService: ChildService,

    private readonly authService: AuthService,

    private readonly anamnesisService: AnamnesisService,

    private readonly associationChildService:
      AssociationChildService,

    private readonly route: ActivatedRoute,

    private readonly router: Router
  ) {}


  ngOnInit(): void {

    this.authService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        this.currentUserName = user?.name?.trim() || user?.email || "Usuário";
        this.currentUserRole = this.activityRoleLabel(user?.role ?? "");
        this.isProfessionalView = user?.role === "therapist" || user?.role === "professional" || user?.role === "enterprise";
        if (this.isProfessionalView) this.showCreateChild = false;
      });

    this.route.queryParamMap
      .pipe(
        map((params) =>
          params.get("childId")
        ),

        distinctUntilChanged(),

        takeUntilDestroyed(
          this.destroyRef
        )
      )

      .subscribe((childId) => {

        const children =
          this.childService
            .getChildrenSnapshot();

        if (!children.length) {
          return;
        }

        this.applySelection(
          childId,
          children
        );
      });


    this.childService
      .loadAccessibleChildren({
        page: 1,
        pageSize: 50,
      })

      .pipe(
        take(1)
      )

      .subscribe({

        next: (children) => {

          this.applySelection(
            this.route.snapshot
              .queryParamMap
              .get("childId"),

            children
          );
        },

        error: () => {
          // O serviço já disponibiliza
          // a mensagem de erro.
        },

      });
  }


  /**
   * Seleciona uma criança.
   */
  onSelectChild(
    child: ChildRecord | null
  ): void {

    this.childService
      .selectChild(child);

    this.activeSection = 0;
    this.previewMode = true;
    this.loadSectionData(child?.id);

    this.syncRouteSelection(
      child?.id ?? null
    );
  }

  onSelectChildById(childId: string, children: ChildRecord[]): void {
    const child = children.find((item) => item.id === childId) ?? null;
    this.onSelectChild(child);
  }

  toggleCreateChild(): void {
    if (this.isProfessionalView) return;
    this.showCreateChild = !this.showCreateChild;
  }

  closeCreateChild(): void {
    this.showCreateChild = false;
  }

  createChild(payload: CreateChildDTO): void {
    if (this.isProfessionalView) return;
    this.childService.createChild(payload).pipe(
      switchMap(() => this.childService.loadAccessibleChildren({ page: 1, pageSize: 50 })),
      take(1),
    ).subscribe({
      next: () => this.closeCreateChild(),
      error: () => {
        // The child service exposes a user-friendly error message.
      },
    });
  }


  /**
   * Associação de criança através
   * do código de acesso.
   */
  onAssociateByAccessCode(
    payload: CreateAssociationChildDTO
  ): void {

    if (this.isProfessionalView) return;

    this.associationChildService

      .associateByAccessCode(payload)

      .pipe(

        switchMap((result) =>

          this.childService
            .loadAccessibleChildren({
              page: 1,
              pageSize: 50,
            })

            .pipe(

              tap((children) => {

                const match =
                  children.find(
                    (child) =>
                      child.id === result.child.id
                  ) ?? null;

                this.childService
                  .selectChild(match);

                this.syncRouteSelection(
                  match?.id ?? null
                );
              })
            )
        ),

        take(1)
      )

      .subscribe({

        next: () => {},

        error: () => {
          // O serviço já disponibiliza
          // a mensagem de erro.
        },

      });
  }


  /**
   * Volta para a página de crianças.
   */
  onBackToChildren(): void {

    this.childService
      .selectChild(null);

    this.router.navigate([
      "/child-profile",
    ]);
  }


  /**
   * Seleciona uma seção do perfil.
   */
  selectSection(
    index: number
  ): void {

    if (
      index < 0 ||
      index >= this.visibleProfileSections.length
    ) {
      return;
    }

    this.activeSection = index;
    this.previewMode = false;
    this.savedMessage = "";

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  showProfilePreview(): void {
    this.previewMode = true;
    this.savedMessage = "";
  }

  continueProfileEdit(): void {
    this.previewMode = false;
    this.activeSection = 0;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  getSectionPreviewLines(index: number, child: ChildRecord): string[] {
    if (index === 0) {
      return [
        `Nome: ${this.getChildName(child)}`,
        `Nascimento: ${this.formatBirthDate(child)}`,
        this.sectionData[0]?.["Gênero"] ? `Gênero: ${this.sectionData[0]["Gênero"]}` : "",
      ].filter(Boolean);
    }
    if (index === 1) {
      return [this.sectionData[1]?.["Diagnóstico principal"], this.sectionData[1]?.["Diagnósticos adicionais"]].filter((value): value is string => Boolean(value?.trim()));
    }
    if (index === 2) {
      return [this.sectionData[2]?.["Condições de saúde"], this.sectionData[2]?.["Alergias"], this.medicationEntries.filter((entry) => entry.name.trim()).map((entry) => entry.name).join(", ")].filter((value): value is string => Boolean(value?.trim()));
    }
    if (index === 3) {
      return this.careProviders.map((provider) => [provider.type, provider.professional, provider.specialty, provider.frequency].filter(Boolean).join(" · ")).filter(Boolean).slice(0, 3);
    }
    const keys: Record<number, string[]> = {
      4: ["Nome da escola", "Série/ano", "Turma"],
      5: ["Rotina", "Atividades favoritas", "Interesses"],
      6: ["Observações gerais"],
    };
    if (index === 7) return this.activityHistory.slice(0, 2).map((entry) => `${entry.action}: ${entry.details}`);
    return (keys[index] ?? []).map((key) => this.sectionData[index]?.[key]).filter((value): value is string => Boolean(value?.trim())).slice(0, 3);
  }

  getSectionPreviewStatus(index: number, child: ChildRecord): string {
    return this.getSectionPreviewLines(index, child).length || index === 0 ? "Preenchido" : "Pendente";
  }


  /**
   * Próxima seção.
   */
  nextSection(): void {
    if (this.activeSection >= this.visibleProfileSections.length - 1) {
      this.finishProfile();
      return;
    }

    if (!this.saveSection()) return;
    this.activeSection++;
  }

  finishProfile(): void {
    if (!this.saveSection()) return;
    this.onBackToChildren();
  }

  saveAndChooseAnotherChild(): void {
    if (!this.saveSection()) return;
    this.onBackToChildren();
  }


  /**
   * Seção anterior.
   */
  previousSection(): void {

    if (this.activeSection > 0) {

      this.activeSection--;
    } else {
      this.showProfilePreview();
    }
  }

  addCareProvider(): void {
    if (this.isProfessionalView) return;
    this.careProviders = [...this.careProviders, this.createCareProvider()];
    this.savedMessage = "";
  }

  removeCareProvider(index: number): void {
    if (this.isProfessionalView) return;
    if (this.careProviders.length === 1) {
      this.careProviders = [this.createCareProvider()];
    } else {
      this.careProviders = this.careProviders.filter((_, currentIndex) => currentIndex !== index);
    }
    this.savedMessage = "";
  }

  addRoutineActivity(day: string): void {
    if (this.isProfessionalView) return;
    this.weekRoutine[day] = [...(this.weekRoutine[day] ?? []), { time: "", activity: "" }];
    this.savedMessage = "";
  }

  removeRoutineActivity(day: string, index: number): void {
    if (this.isProfessionalView) return;
    this.weekRoutine[day] = (this.weekRoutine[day] ?? []).filter((_, currentIndex) => currentIndex !== index);
    this.savedMessage = "";
  }

  addMedication(): void {
    if (this.isProfessionalView) return;
    this.medicationEntries = [...this.medicationEntries, this.createMedication()];
    this.savedMessage = "";
  }

  removeMedication(index: number): void {
    if (this.isProfessionalView) return;
    this.medicationEntries = this.medicationEntries.filter((_, currentIndex) => currentIndex !== index);
    this.savedMessage = "";
  }

  private createMedication(name = ""): ChildMedication {
    return { name, concentration: "", dosage: "", schedule: "", route: "", notes: "" };
  }

  private parseMedications(value: unknown): ChildMedication[] {
    if (typeof value !== "string" || !value.trim()) return [];
    const prefix = "MWMED:";
    if (value.startsWith(prefix)) {
      try {
        const parsed = JSON.parse(value.slice(prefix.length));
        if (Array.isArray(parsed)) return parsed.map((item) => ({ ...this.createMedication(), ...item }));
      } catch { /* Keep legacy medication text below. */ }
    }
    return value.split(/\n+/).map((entry) => entry.trim()).filter(Boolean).map((entry) => {
      const [name = "", concentration = "", dosage = "", schedule = "", route = "", notes = ""] = entry.split(" · ");
      return { name, concentration, dosage, schedule, route, notes };
    });
  }

  private serializeMedications(): string | null {
    const entries = this.medicationEntries.filter((item) => Object.values(item).some((value) => value.trim()));
    return entries.length ? entries.map((item) => [item.name, item.concentration, item.dosage, item.schedule, item.route, item.notes].filter(Boolean).join(" · ")).join("\n") : null;
  }

  get filteredActivityHistory(): ProfileActivity[] {
    return this.activityHistory.filter((activity) => {
      const date = new Date(activity.createdAt).toLocaleDateString("en-CA");
      const matchesFrom = !this.activityFrom || date >= this.activityFrom;
      const matchesTo = !this.activityTo || date <= this.activityTo;
      const matchesSection = this.activityArea === "all" || activity.section === this.profileSections[Number(this.activityArea)]?.title;
      const searchable = `${activity.actor} ${activity.section} ${activity.action} ${activity.details}`.toLocaleLowerCase();
      const matchesSearch = !this.activitySearch.trim() || searchable.includes(this.activitySearch.trim().toLocaleLowerCase());
      return matchesFrom && matchesTo && matchesSection && matchesSearch;
    });
  }

  get paginatedActivityHistory(): ProfileActivity[] {
    const start = (this.activityPage - 1) * this.activityPageSize;
    return this.filteredActivityHistory.slice(start, start + this.activityPageSize);
  }

  get activityPageCount(): number {
    return Math.max(1, Math.ceil(this.filteredActivityHistory.length / this.activityPageSize));
  }

  get activityRangeEnd(): number {
    return Math.min(this.activityPage * this.activityPageSize, this.filteredActivityHistory.length);
  }

  formatActivityDate(value: string): string {
    return new Date(value).toLocaleDateString("pt-BR");
  }

  formatActivityTime(value: string): string {
    return new Date(value).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  setActivityPage(page: number): void {
    this.activityPage = Math.max(1, Math.min(this.activityPageCount, page));
  }

  private activityRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      guardian: "Responsável", parent: "Responsável", therapist: "Terapeuta",
      professional: "Profissional de saúde", teacher: "Profissional da escola",
      school: "Profissional da escola", enterprise: "Clínica",
    };
    return labels[role.toLocaleLowerCase()] ?? "Usuário";
  }

  exportActivityHistory(): void {
    const rows = [["Data", "Horário", "Usuário", "Seção", "Ação", "Detalhes"], ...this.filteredActivityHistory.map((item) => [
      this.formatActivityDate(item.createdAt), this.formatActivityTime(item.createdAt), item.actor, item.section, item.action, item.details,
    ])];
    const csv = "\uFEFF" + rows.map((row) => row.map((value) => `"${value.replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "historico-atividades-crianca.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  private createActivityEntry(): ProfileActivity {
    const section = this.profileSections[this.activeSection];
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      section: section.title,
      action: "Salvou alterações",
      details: `Atualizou a seção ${section.title.toLocaleLowerCase()}.`,
      actor: this.currentUserName,
      actorRole: this.currentUserRole,
    };
  }

  saveSection(): boolean {
    if (this.isProfessionalView) return true;
    const child = this.childService.getSelectedChildSnapshot();
    if (!child) {
      this.savedMessage = "Selecione uma criança antes de salvar.";
      return false;
    }

    try {
      const nextHistory = this.activeSection === 7
        ? this.activityHistory
        : [this.createActivityEntry(), ...this.activityHistory].slice(0, 500);
      localStorage.setItem(`mindway-child-profile-${child.id}`, JSON.stringify({
        sections: this.sectionData,
        careProviders: this.careProviders,
        weekRoutine: this.weekRoutine,
        medicationEntries: this.medicationEntries,
        activityHistory: nextHistory,
        photo: this.childPhoto,
      }));
      this.activityHistory = nextHistory;
      const request$ = this.persistSectionToApi(child.id);
      if (!request$) {
        this.savedMessage = "Dados salvos neste dispositivo. Esta seção ainda não é salva no servidor.";
        return true;
      }

      this.savedMessage = "Salvando alterações no servidor...";
      request$.pipe(take(1)).subscribe({
        next: () => this.savedMessage = "Dados salvos neste dispositivo; campos compativeis sincronizados com o servidor.",
        error: () => this.savedMessage = "Rascunho salvo neste dispositivo, mas não foi possível sincronizar com o servidor.",
      });
      return true;
    } catch {
      this.savedMessage = "Não foi possível salvar os dados neste navegador.";
      return false;
    }
  }

  private persistSectionToApi(childId: string): Observable<unknown> | null {
    const sectionIndex = this.activeSection;
    if (sectionIndex === 0) {
      const observation = this.sectionData[0]["observacoes"]?.trim() ?? "";
      return this.childService.updateChild(childId, { observation: observation || null });
    }

    if (sectionIndex === 1 || sectionIndex === 2) {
      return this.ensureAnamnesis(childId).pipe(
        switchMap((anamnesis) => {
          const health = anamnesis.health;
          const payload: UpsertAnamnesisHealthDTO = sectionIndex === 1
            ? {
                diagnosis: this.sectionData[1]["Diagnóstico principal"]?.trim() || null,
                medication: health?.medication ?? null,
                allergies: health?.allergies ?? null,
              }
            : {
                diagnosis: health?.diagnosis ?? null,
                medication: this.serializeMedications(),
                allergies: this.sectionData[2]["Alergias"]?.trim() || null,
              };
          return this.anamnesisService.upsertHealth(childId, payload, Boolean(health));
        }),
        tap((anamnesis) => this.currentAnamnesis = anamnesis),
      );
    }

    if (sectionIndex >= 3 && sectionIndex <= 5) {
      return this.ensureAnamnesis(childId).pipe(
        switchMap((anamnesis) => {
          const routine = anamnesis.routine;
          const payload: UpsertAnamnesisRoutineDTO = {
            wakesUpAt: routine?.wakesUpAt ?? null,
            therapies: sectionIndex === 3
              ? this.careProviders.map((provider) => [provider.type, provider.professional, provider.specialty, provider.clinic, provider.frequency, provider.schedule, provider.notes].filter(Boolean).join(" · ")).filter(Boolean).join("\n") || null
              : routine?.therapies ?? null,
            schoolPeriod: sectionIndex === 4
              ? this.sectionData[4]["Série/ano"]?.trim() || null
              : routine?.schoolPeriod ?? null,
            extraActivity: routine?.extraActivity ?? null,
            sleepsAt: routine?.sleepsAt ?? null,
            routineObservation: sectionIndex === 5
              ? [
                  this.sectionData[5]["Observações sobre a rotina"]?.trim(),
                  this.weekDays.map(({ key, label }) => {
                    const activities = (this.weekRoutine[key] ?? []).map((item) => [item.time, item.activity].filter(Boolean).join(" ")).filter(Boolean);
                    return activities.length ? `${label}: ${activities.join(", ")}` : "";
                  }).filter(Boolean).join("\n"),
                ].filter(Boolean).join("\n\n") || null
              : routine?.routineObservation ?? null,
          };
          return this.anamnesisService.upsertRoutine(childId, payload, Boolean(routine));
        }),
        tap((anamnesis) => this.currentAnamnesis = anamnesis),
      );
    }

    if (sectionIndex === 6) {
      return this.ensureAnamnesis(childId).pipe(
        switchMap((anamnesis) => this.anamnesisService.updateGeneralNotes(childId, {
          generalNotes: this.sectionData[6]["Observações gerais"]?.trim() || null,
        })),
        tap((anamnesis) => this.currentAnamnesis = anamnesis),
      );
    }

    return null;
  }

  private ensureAnamnesis(childId: string) {
    return this.anamnesisService.loadByChildId(childId).pipe(
      take(1),
      switchMap((anamnesis) => anamnesis ? of(anamnesis) : this.anamnesisService.createAnamnesis(childId)),
      tap((anamnesis) => this.currentAnamnesis = anamnesis),
    );
  }

  private loadSectionData(childId?: string): void {
    this.sectionData = Array.from({ length: 8 }, () => ({}));
    this.childPhoto = null;
    this.careProviders = [this.createCareProvider()];
    this.weekRoutine = this.createWeekRoutine();
    this.medicationEntries = [];
    this.activityHistory = [];
    this.activityPage = 1;
    this.activitySearch = "";
    this.activityArea = "all";
    this.hasLocalMedicationEntries = false;
    this.currentAnamnesis = null;
    if (!childId) return;
    const selectedChild = this.childService.getSelectedChildSnapshot();
    if (selectedChild) {
      this.sectionData[0]["Gênero"] = this.normalizeGender(this.getChildGender(selectedChild));
      if (selectedChild.observation) this.sectionData[0]["observacoes"] = selectedChild.observation;
    }
    if (typeof localStorage === "undefined") return;
    try {
      const saved = localStorage.getItem(`mindway-child-profile-${childId}`);
      const parsed = saved ? JSON.parse(saved) : null;
      if (Array.isArray(parsed)) {
        // Migrate drafts saved before care providers became a repeatable list.
        this.sectionData = parsed;
        this.medicationEntries = this.parseMedications(parsed[2]?.["Medicamentos"]);
        this.hasLocalMedicationEntries = Boolean(parsed[2]?.["Medicamentos"]);
        const oldRoutine = parsed[5]?.["Rotina"];
        if (oldRoutine?.trim()) this.sectionData[5]["Observações sobre a rotina"] = oldRoutine;
        const legacy = parsed[3] ?? {};
        if (Object.values(legacy).some((value) => typeof value === "string" && value.trim())) {
          this.careProviders = [{
            ...this.createCareProvider(),
            clinic: legacy["Clínica"] ?? "",
            clinicPhone: legacy["Telefone da clínica"] ?? "",
            professional: legacy["Profissionais"] ?? "",
            specialty: legacy["Especialidade"] ?? "",
            frequency: legacy["Frequência"] ?? "",
            schedule: legacy["Dias e horários"] ?? "",
            notes: legacy["Observações"] ?? "",
          }];
        }
      } else {
        this.sectionData = parsed?.sections ?? this.sectionData;
        this.childPhoto = parsed?.photo ?? parsed?.photoUrl ?? null;
        this.activityHistory = Array.isArray(parsed?.activityHistory)
          ? parsed.activityHistory.map((item: Partial<ProfileActivity>) => ({
              id: item.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              createdAt: item.createdAt ?? new Date().toISOString(),
              section: item.section ?? "Perfil da criança",
              action: item.action ?? "Salvou alterações",
              details: item.details ?? item.description ?? "Atualizou informações do perfil.",
              actor: item.actor ?? "Usuário",
              actorRole: item.actorRole ?? "Usuário",
            }))
          : [];
        if (Array.isArray(parsed?.medicationEntries)) {
          this.medicationEntries = parsed.medicationEntries.map((item: Partial<ChildMedication>) => ({ ...this.createMedication(), ...item }));
          this.hasLocalMedicationEntries = true;
        } else {
          this.medicationEntries = this.parseMedications(this.sectionData[2]?.["Medicamentos"]);
          this.hasLocalMedicationEntries = Boolean(this.sectionData[2]?.["Medicamentos"]);
        }
        this.careProviders = parsed?.careProviders?.length
          ? parsed.careProviders
          : [this.createCareProvider()];
        const savedRoutine = parsed?.weekRoutine ?? {};
        this.weekRoutine = Object.fromEntries(this.weekDays.map(({ key }) => [
          key,
          Array.isArray(savedRoutine[key]) ? savedRoutine[key] : [],
        ]));
      }
      for (const sectionIndex of Object.keys(this.sectionData)) {
        const index = Number(sectionIndex);
        const section = this.sectionData[index] ?? {};
        this.sectionData[index] = Object.fromEntries(
          Object.entries(section).map(([label, value]) => [this.decodeStoredLabel(label), value])
        );
      }
      const diagnostics = this.sectionData[1];
      if (diagnostics["Profissional que fez o diagnóstico"] === undefined && diagnostics["Profissional responsável"] !== undefined) {
        diagnostics["Profissional que fez o diagnóstico"] = diagnostics["Profissional responsável"];
      }
    } catch {
      this.sectionData = Array.from({ length: 8 }, () => ({}));
      this.careProviders = [this.createCareProvider()];
      this.weekRoutine = this.createWeekRoutine();
      this.medicationEntries = [];
      this.activityHistory = [];
    }
    if (selectedChild?.anamnesis) {
      this.currentAnamnesis = selectedChild.anamnesis;
      this.applyAnamnesisData(selectedChild.anamnesis);
    }
    this.anamnesisService.loadByChildId(childId).pipe(take(1)).subscribe({
      next: (anamnesis) => {
        if (this.childService.getSelectedChildSnapshot()?.id !== childId) return;
        this.currentAnamnesis = anamnesis;
        if (anamnesis) this.applyAnamnesisData(anamnesis);
      },
      error: () => {},
    });
    if (selectedChild && !this.sectionData[0]["Gênero"]) {
      this.sectionData[0]["Gênero"] = this.normalizeGender(this.getChildGender(selectedChild));
    }
  }

  private applyAnamnesisData(anamnesis: NonNullable<ChildRecord["anamnesis"]>): void {
    const health = anamnesis.health;
    const routine = anamnesis.routine;
    if (health?.diagnosis) this.sectionData[1]["Diagnóstico principal"] = health.diagnosis;
    if (health?.allergies) this.sectionData[2]["Alergias"] = health.allergies;
    if (health?.medication && !this.hasLocalMedicationEntries) this.medicationEntries = this.parseMedications(health.medication);
    if (routine?.therapies) this.sectionData[3]["Profissionais"] = routine.therapies;
    if (routine?.schoolPeriod) this.sectionData[4]["Série/ano"] = routine.schoolPeriod;
    if (routine?.routineObservation) this.sectionData[5]["Observações sobre a rotina"] = routine.routineObservation;
    if (anamnesis.generalNotes) this.sectionData[6]["Observações gerais"] = anamnesis.generalNotes;
  }

  private decodeStoredLabel(label: string): string {
    if (!/[ÃÂ]/.test(label)) return label;
    try {
      const bytes = Uint8Array.from(Array.from(label, (character) => character.charCodeAt(0)));
      return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
      return label;
    }
  }

  private createCareProvider(): ChildCareProvider {
    return {
      type: "Terapia",
      clinic: "",
      clinicPhone: "",
      professional: "",
      specialty: "",
      frequency: "",
      schedule: "",
      notes: "",
    };
  }

  private createWeekRoutine(): Record<string, RoutineActivity[]> {
    return Object.fromEntries(this.weekDays.map(({ key }) => [key, []]));
  }

  formatBirthDate(child: ChildRecord): string {
    const value = (child as any).birthDate ?? (child as any).dateOfBirth ?? (child as any).birth_date;
    if (!value) return "Não informado";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
  }


  /**
   * Nome da criança.
   *
   * O acesso é mantido tolerante nesta primeira
   * etapa porque ainda vamos conferir exatamente
   * os campos existentes no ChildRecord.
   */
  getChildName(
    child: ChildRecord
  ): string {

    const data =
      child as any;

    return (
      data.name ??
      data.fullName ??
      data.nome ??
      "Criança"
    );
  }


  /**
   * Inicial para o avatar.
   */
  getChildInitial(
    child: ChildRecord
  ): string {

    const name =
      this.getChildName(child)
        .trim();

    return name
      ? name.charAt(0).toUpperCase()
      : "C";
  }

  getChildPhoto(child: ChildRecord): string | null {
    const data = child as any;
    const photo = data.photoUrl ?? data.avatarUrl ?? data.imageUrl ?? data.photo;
    if (photo) return photo;
    if (this.childService.getSelectedChildSnapshot()?.id === child.id && this.childPhoto) return this.childPhoto;
    if (typeof localStorage !== "undefined") {
      try {
        const saved = localStorage.getItem(`mindway-child-profile-${child.id}`);
        const parsed = saved ? JSON.parse(saved) : null;
        return parsed?.photo ?? parsed?.photoUrl ?? null;
      } catch {
        return null;
      }
    }
    return null;
  }

  onChildPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.childPhoto = String(reader.result);
      this.saveSection();
    };
    reader.readAsDataURL(file);
    input.value = "";
  }


  /**
   * Data de nascimento.
   */
  getChildBirthDate(
    child: ChildRecord
  ): string {

    const data =
      child as any;

    return (
      data.birthDate ??
      data.dateOfBirth ??
      data.birth_date ??
      data.dataNascimento ??
      "Não informado"
    );
  }


  /**
   * Idade.
   */
  getChildAge(
    child: ChildRecord
  ): string {

    const data =
      child as any;

    if (
      data.age !== undefined &&
      data.age !== null
    ) {

      return `${data.age} anos`;
    }

    const birthDate =
      data.birthDate ??
      data.dateOfBirth ??
      data.birth_date ??
      data.dataNascimento;

    if (!birthDate) {
      return "Idade não informada";
    }

    const birth =
      new Date(birthDate);

    if (
      Number.isNaN(
        birth.getTime()
      )
    ) {

      return "Idade não informada";
    }

    const today =
      new Date();

    let age =
      today.getFullYear() -
      birth.getFullYear();

    const month =
      today.getMonth() -
      birth.getMonth();

    if (
      month < 0 ||
      (
        month === 0 &&
        today.getDate() <
        birth.getDate()
      )
    ) {

      age--;
    }

    return `${age} anos`;
  }


  /**
   * Gênero.
   */
  getChildGender(
    child: ChildRecord
  ): string {

    const data =
      child as any;

    const value = data.gender ?? data.sex ?? data.genero ?? "";
    if (typeof value !== "string") return "";
    const normalized = value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
    return normalized === "nao informado" ? "" : value.trim();
  }

  private normalizeGender(value: string): string {
    const normalized = value.trim().toLowerCase();
    const aliases: Record<string, string> = {
      feminino: "Feminino",
      female: "Feminino",
      f: "Feminino",
      masculino: "Masculino",
      male: "Masculino",
      m: "Masculino",
      "não binário": "Não binário",
      "nao binario": "Não binário",
      nonbinary: "Não binário",
      "prefiro não informar": "Prefiro não informar",
      "prefiro nao informar": "Prefiro não informar",
      outro: "Outro",
      other: "Outro",
    };

    return aliases[normalized] ?? (normalized === "não informado" || normalized === "nao informado" ? "" : value);
  }


  /**
   * Código de acesso.
   */
  getChildAccessCode(
    child: ChildRecord
  ): string {

    const data =
      child as any;

    return (
      data.accessCode ??
      data.access_code ??
      data.codigoAcesso ??
      "Não informado"
    );
  }


  /**
   * Diagnósticos exibidos como tags.
   */
  getChildDiagnoses(child: ChildRecord): string[] {
    const data = child as any;
    const diagnoses: string[] = [];
    const append = (value: unknown): void => {
      const values = Array.isArray(value) ? value : [value];
      for (const item of values) {
        const text = typeof item === "string"
          ? item
          : item && typeof item === "object"
            ? (item as any).name ?? (item as any).title ?? (item as any).nome ?? ""
            : "";
        if (typeof text === "string") diagnoses.push(...text.split(/[,;\n]+/).map((entry) => entry.trim()).filter(Boolean));
      }
    };
    append(data.diagnoses);
    append(data.diagnosis);
    append(data.diagnosticos);
    append(data.anamnesis?.health?.diagnosis);
    if (typeof localStorage !== "undefined") {
      try {
        const saved = localStorage.getItem(`mindway-child-profile-${child.id}`);
        const parsed = saved ? JSON.parse(saved) : null;
        const section = Array.isArray(parsed) ? parsed[1] : parsed?.sections?.[1];
        if (section && typeof section === "object") {
          for (const [label, value] of Object.entries(section)) {
            const normalized = label.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
            if (normalized.includes("diagn") && !/(profissional|medic[oa]|responsavel|quem|nome)/.test(normalized) && typeof value === "string") append(value);
          }
        }
      } catch {
        // Keep the diagnoses supplied by the API when a local draft cannot be read.
      }
    }
    return [...new Set(diagnoses)].slice(0, 4);
  }


  /**
   * Seleção inicial da criança.
   */
  private applySelection(
    childId: string | null,
    children: ChildRecord[]
  ): void {

    const normalized =
      childId?.trim() ?? "";

    if (normalized) {

      this.childService
        .selectChildById(
          normalized
        );
      this.activeSection = 0;
      this.loadSectionData(normalized);

      return;
    }


    const currentSelected =
      this.childService
        .getSelectedChildSnapshot();


    if (
      currentSelected &&
      children.some(
        (child) =>
          child.id ===
          currentSelected.id
      )
    ) {

      this.childService
        .selectChild(
          currentSelected
        );
      this.loadSectionData(currentSelected.id);

      return;
    }


    this.childService
      .selectChild(null);
    this.activeSection = 0;
  }


  /**
   * Mantém a criança selecionada
   * na URL.
   */
  private syncRouteSelection(
    childId: string | null
  ): void {

    this.router.navigate(
      [],

      {
        relativeTo: this.route,

        queryParams: {
          childId:
            childId || null,
        },

        queryParamsHandling:
          "merge",

        replaceUrl: true,
      }
    );
  }
}
