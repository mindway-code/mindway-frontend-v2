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
  switchMap,
  take,
  tap,
} from "rxjs";

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
  ];


  /**
   * Seção atualmente selecionada.
   */
  activeSection = 0;

  sectionFields: Record<number, string[]> = {
    1: ["Diagnóstico principal", "Diagnósticos adicionais", "Data do diagnóstico", "Profissional que fez o diagnóstico", "Observações"],
    2: ["Alergias", "Medicamentos", "Condições de saúde", "Restrições", "Observações"],
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

  sectionData: Record<number, Record<string, string>> = Array.from({ length: 7 }, () => ({}));
  childPhoto: string | null = null;
  careProviders: ChildCareProvider[] = [this.createCareProvider()];
  weekRoutine: Record<string, RoutineActivity[]> = this.createWeekRoutine();
  savedMessage = "";
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
      index >= this.profileSections.length
    ) {
      return;
    }

    this.activeSection = index;
    this.savedMessage = "";

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }


  /**
   * Próxima seção.
   */
  nextSection(): void {
    if (this.activeSection === this.profileSections.length - 1) {
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

  saveSection(): boolean {
    if (this.isProfessionalView) return true;
    const child = this.childService.getSelectedChildSnapshot();
    if (!child) {
      this.savedMessage = "Selecione uma criança antes de salvar.";
      return false;
    }

    try {
      localStorage.setItem(`mindway-child-profile-${child.id}`, JSON.stringify({
        sections: this.sectionData,
        careProviders: this.careProviders,
        weekRoutine: this.weekRoutine,
        photo: this.childPhoto,
      }));
      this.savedMessage = "Dados salvos neste dispositivo.";
      return true;
    } catch {
      this.savedMessage = "Não foi possível salvar os dados neste navegador.";
      return false;
    }
  }

  private loadSectionData(childId?: string): void {
    this.sectionData = Array.from({ length: 7 }, () => ({}));
    this.childPhoto = null;
    this.careProviders = [this.createCareProvider()];
    this.weekRoutine = this.createWeekRoutine();
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
      this.sectionData = Array.from({ length: 7 }, () => ({}));
      this.careProviders = [this.createCareProvider()];
      this.weekRoutine = this.createWeekRoutine();
    }
    if (this.isProfessionalView && selectedChild?.anamnesis) {
      this.applyAnamnesisData(selectedChild.anamnesis);
    }
    if (this.isProfessionalView) {
      this.anamnesisService.loadByChildId(childId).pipe(take(1)).subscribe({
        next: (anamnesis) => {
          if (anamnesis && this.childService.getSelectedChildSnapshot()?.id === childId) {
            this.applyAnamnesisData(anamnesis);
          }
        },
        error: () => {},
      });
    }
    if (selectedChild && !this.sectionData[0]["Gênero"]) {
      this.sectionData[0]["Gênero"] = this.normalizeGender(this.getChildGender(selectedChild));
    }
  }

  private applyAnamnesisData(anamnesis: NonNullable<ChildRecord["anamnesis"]>): void {
    const health = anamnesis.health;
    const routine = anamnesis.routine;
    if (health?.diagnosis) this.sectionData[1]["Diagnóstico principal"] = health.diagnosis;
    if (health?.allergies) this.sectionData[2]["Alergias"] = health.allergies;
    if (health?.medication) this.sectionData[2]["Medicamentos"] = health.medication;
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
