import {
  Component,
  DestroyRef,
  OnInit,
  inject,
} from "@angular/core";

import { ActivatedRoute } from "@angular/router";

import {
  takeUntilDestroyed,
} from "@angular/core/rxjs-interop";

import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  take,
  tap,
} from "rxjs";

import { AnamnesisService } from "../../services/anamnesis.service";
import { ChildService } from "../../services/child.service";
import { AuthService } from "../../services/auth.service";

import type { ChildRecord } from "../../api/interfaces/child.interface";

import type {
  AnamnesisRecord,
  UpdateAnamnesisGeneralNotesDTO,
  UpsertAnamnesisBehaviorDTO,
  UpsertAnamnesisBirthDTO,
  UpsertAnamnesisHealthDTO,
  UpsertAnamnesisLanguageCommunicationDTO,
  UpsertAnamnesisMotorDevelopmentDTO,
  UpsertAnamnesisRoutineDTO,
} from "../../api/interfaces/anamnesis.interface";


/**
 * Seções disponíveis na anamnese.
 */
type AnamnesisSection =
  | "birth"
  | "motorDevelopment"
  | "languageCommunication"
  | "health"
  | "behavior"
  | "routine"
  | "generalNotes";


@Component({
  selector: "app-anamnesis",
  standalone: false,
  templateUrl: "./anamnesis.component.html",
  styleUrls: ["./anamnesis.component.scss"],
})
export class AnamnesisComponent implements OnInit {

  // =========================================================
  // INJEÇÕES
  // =========================================================

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly anamnesisService: AnamnesisService,
    private readonly childService: ChildService,
    private readonly authService: AuthService
  ) {}


  // =========================================================
  // CRIANÇA SELECIONADA
  // =========================================================

  private readonly selectedChildIdSubject =
    new BehaviorSubject<string | null>(null);


  selectedChildId: string | null = null;
  isProfessionalView = false;
  readOnlyOpenSection: AnamnesisSection | null = "birth";


  readonly children$ =
    this.childService.children$;


  readonly childrenLoading$ =
    this.childService.loading$;


  readonly childrenError$ =
    this.childService.error$;


  readonly selectedChild$ =
    combineLatest([
      this.children$,
      this.selectedChildIdSubject,
    ]).pipe(
      map(([children, childId]) => {
        return (
          children.find(
            (child) => child.id === childId
          ) ?? null
        );
      })
    );


  // =========================================================
  // ANAMNESE
  // =========================================================

  readonly anamnesis$ =
    this.anamnesisService.anamnesis$;


  readonly loading$ =
    this.anamnesisService.loading$;


  readonly saving$ =
    this.anamnesisService.saving$;


  readonly error$ =
    this.anamnesisService.error$;


  // =========================================================
  // RESUMO
  // =========================================================

  readonly overview$ =
    combineLatest([
      this.selectedChild$,
      this.anamnesis$,
    ]).pipe(
      map(([child, anamnesis]) =>
        this.buildOverview(
          child,
          anamnesis
        )
      )
    );


  // =========================================================
  // ETAPAS
  // =========================================================

  readonly sectionOrder: AnamnesisSection[] = [
    "birth",
    "motorDevelopment",
    "languageCommunication",
    "health",
    "behavior",
    "routine",
    "generalNotes",
  ];


  readonly sectionLabels: Record<
    AnamnesisSection,
    string
  > = {

    birth:
      "Gesta\u00e7\u00e3o e nascimento",

    motorDevelopment:
      "Desenvolvimento motor",

    languageCommunication:
      "Linguagem e comunica\u00e7\u00e3o",

    health:
      "Sa\u00fade",

    behavior:
      "Comportamento",

    routine:
      "Rotina e acompanhamento",

    generalNotes:
      "Observa\u00e7\u00f5es gerais",
  };


  /**
   * Descri\u00e7\u00e3o de cada etapa.
   */
  readonly sectionDescriptions: Record<
    AnamnesisSection,
    string
  > = {

    birth:
      "Informa\u00e7\u00f5es sobre gesta\u00e7\u00e3o, parto e nascimento.",

    motorDevelopment:
      "Marcos motores e coordena\u00e7\u00e3o da crian\u00e7a.",

    languageCommunication:
      "Desenvolvimento da fala, compreens\u00e3o e comunica\u00e7\u00e3o.",

    health:
      "Diagn\u00f3sticos, medicamentos e alergias.",

    behavior:
      "Concentra\u00e7\u00e3o, intera\u00e7\u00e3o, ansiedade e comportamento.",

    routine:
      "Sono, escola, terapias e atividades da crian\u00e7a.",

    generalNotes:
      "Outras informa\u00e7\u00f5es importantes sobre a crian\u00e7a.",
  };


  // =========================================================
  // ETAPA ATUAL
  // =========================================================

  activeSection:
    | AnamnesisSection
    | null = null;


  /**
   * Nome da etapa atualmente aberta.
   */
  get activeSectionLabel(): string {

    if (!this.activeSection) {
      return "";
    }

    return this.sectionLabels[
      this.activeSection
    ];
  }


  /**
   * Descrição da etapa atualmente aberta.
   */
  get activeSectionDescription(): string {

    if (!this.activeSection) {
      return "";
    }

    return this.sectionDescriptions[
      this.activeSection
    ];
  }


  /**
   * Número da etapa atual.
   */
  get activeSectionNumber(): number {

    if (!this.activeSection) {
      return 0;
    }

    return (
      this.sectionOrder.indexOf(
        this.activeSection
      ) + 1
    );
  }


  /**
   * Percentual de progresso.
   */
  get activeSectionPercent(): number {

    if (!this.activeSection) {
      return 0;
    }

    return Math.round(
      (
        this.activeSectionNumber /
        this.sectionOrder.length
      ) * 100
    );
  }


  /**
   * Verifica se é a última etapa.
   */
  get isLastSection(): boolean {

    return (
      this.activeSection ===
      this.sectionOrder[
        this.sectionOrder.length - 1
      ]
    );
  }


  /**
   * Controla se a etapa atual já foi salva.
   */
  sectionWasSaved = false;


  /**
   * Cópia local da anamnese.
   */
  private anamnesisSnapshot:
    | AnamnesisRecord
    | null = null;


  // =========================================================
  // CICLO DE VIDA
  // =========================================================

  ngOnInit(): void {

    this.authService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        this.isProfessionalView = user?.role === "therapist" || user?.role === "professional" || user?.role === "enterprise";
      });

    /**
     * Carrega as crianças disponíveis.
     */
    this.childService
      .loadAccessibleChildren({
        page: 1,
        pageSize: 50,
      })
      .pipe(take(1))
      .subscribe({
        next: () => {

          if (this.selectedChildId) {

            this.childService.selectChildById(
              this.selectedChildId
            );

          }

        },

        error: () => {
          // O ChildService já trata o erro.
        },
      });


    /**
     * Mantém uma cópia local da anamnese.
     */
    this.anamnesis$
      .pipe(

        tap((anamnesis) => {

          this.anamnesisSnapshot =
            anamnesis;

        }),

        takeUntilDestroyed(
          this.destroyRef
        )

      )
      .subscribe();


    /**
     * Permite abrir a anamnese usando:
     *
     * ?childId=...
     */
    this.route.queryParamMap
      .pipe(

        map((params) =>
          params.get("childId")
        ),

        filter(
          (
            childId
          ): childId is string =>
            Boolean(childId)
        ),

        distinctUntilChanged(),

        takeUntilDestroyed(
          this.destroyRef
        )

      )
      .subscribe((childId) => {

        this.onChildSelected(
          childId
        );

      });
  }


  // =========================================================
  // SELEÇÃO DA CRIANÇA
  // =========================================================

  onChildSelected(
    childId: string
  ): void {

    /**
     * Ao trocar de criança,
     * fecha a etapa atual.
     */
    this.activeSection = null;
    this.readOnlyOpenSection = "birth";

    this.sectionWasSaved = false;


    const normalized =
      childId?.trim() ?? "";


    /**
     * Nenhuma criança selecionada.
     */
    if (!normalized) {

      this.selectedChildId = null;

      this.selectedChildIdSubject.next(
        null
      );

      this.childService.selectChild(
        null
      );

      this.anamnesisService.clearState();

      return;
    }


    /**
     * Define a criança.
     */
    this.selectedChildId =
      normalized;


    this.selectedChildIdSubject.next(
      normalized
    );


    this.childService.selectChildById(
      normalized
    );


    /**
     * Limpa o estado anterior.
     */
    this.anamnesisService.clearState();


    /**
     * Carrega a anamnese.
     */
    this.anamnesisService
      .loadByChildId(normalized)
      .subscribe();
  }

  toggleReadOnlySection(section: AnamnesisSection): void {
    this.readOnlyOpenSection = this.readOnlyOpenSection === section ? null : section;
  }

  getReadOnlyFields(anamnesis: AnamnesisRecord, section: AnamnesisSection): Array<{ label: string; value: string }> {
    if (section === "generalNotes") {
      return anamnesis.generalNotes?.trim()
        ? [{ label: "Observações gerais", value: anamnesis.generalNotes.trim() }]
        : [];
    }
    const data = anamnesis[section] as unknown as Record<string, unknown> | null | undefined;
    if (!data) return [];
    const labels: Record<string, string> = {
      gestationalWeeks: "Idade gestacional ao nascer",
      birthType: "Tipo de parto",
      birthWeightGrams: "Peso ao nascer",
      birthHeightCentimeters: "Comprimento ao nascer",
      apgarOneMinute: "Apgar no primeiro minuto",
      apgarFiveMinutes: "Apgar no quinto minuto",
      birthComplication: "Intercorrências no parto",
      hospitalizationDays: "Dias de internação",
      neckControlAgeMonths: "Controle cervical (meses)",
      sittingAgeMonths: "Sentou sem apoio (meses)",
      crawlingAgeMonths: "Engatinhou (meses)",
      firstStepsAgeMonths: "Primeiros passos (meses)",
      fineCoordination: "Coordenação motora fina",
      firstWordsAgeMonths: "Primeiras palavras (meses)",
      fullSentencesAgeMonths: "Frases completas (meses)",
      comprehension: "Compreensão",
      currentCommunication: "Comunicação atual",
      diagnosis: "Diagnósticos",
      medication: "Medicamentos",
      allergies: "Alergias",
      concentrationDifficulty: "Dificuldade de concentração",
      interaction: "Interação",
      activityPreference: "Preferência de atividade",
      anxiety: "Ansiedade",
      hyperactivity: "Hiperatividade",
      wakesUpAt: "Horário que acorda",
      therapies: "Terapias",
      schoolPeriod: "Período escolar",
      extraActivity: "Atividades extras",
      sleepsAt: "Horário que dorme",
      routineObservation: "Observações sobre a rotina",
    };
    return Object.entries(data)
      .filter(([key, value]) => !["id", "anamnesisId", "createdAt", "updatedAt"].includes(key) && value !== null && value !== undefined && String(value).trim() !== "")
      .map(([key, value]) => ({
        label: labels[key] ?? key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase()),
        value: key === "gestationalWeeks" ? `${value} semanas`
          : key === "birthWeightGrams" ? `${(Number(value) / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} kg`
          : key.endsWith("AgeMonths") ? `${value} meses`
          : String(value),
      }));
  }

  getChildInitial(child: ChildRecord): string {
    return child.name?.trim().charAt(0).toUpperCase() || "C";
  }

  getChildPhoto(child: ChildRecord): string | null {
    const data = child as any;
    const photo = data.photoUrl ?? data.avatarUrl ?? data.imageUrl ?? data.photo;
    if (typeof photo === "string" && photo.trim()) return photo;
    if (typeof localStorage !== "undefined") {
      try {
        const saved = localStorage.getItem(`mindway-child-profile-${child.id}`);
        const profile = saved ? JSON.parse(saved) : null;
        const savedPhoto = profile?.photo ?? profile?.photoUrl;
        return typeof savedPhoto === "string" && savedPhoto.trim() ? savedPhoto : null;
      } catch {
        return null;
      }
    }
    return null;
  }

  getChildAge(child: ChildRecord): string {
    if (child.age !== null && child.age !== undefined) return `${child.age} anos`;
    const birthDate = new Date(child.birthDate);
    if (Number.isNaN(birthDate.getTime())) return "Idade não informada";
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) age--;
    return `${age} anos`;
  }

  formatChildBirthDate(child: ChildRecord): string {
    if (!child.birthDate) return "Nascimento não informado";
    const birthDate = new Date(child.birthDate);
    return Number.isNaN(birthDate.getTime())
      ? "Nascimento não informado"
      : birthDate.toLocaleDateString("pt-BR", { timeZone: "UTC" });
  }

  getChildGender(child: ChildRecord): string {
    const data = child as any;
    return data.gender ?? data.sex ?? data.genero ?? "Não informado";
  }

  getChildDiagnoses(child: ChildRecord): string[] {
    const data = child as any;
    const result: string[] = [];
    const append = (value: unknown): void => {
      const values = Array.isArray(value) ? value : [value];
      for (const item of values) {
        const text = typeof item === "string"
          ? item
          : item && typeof item === "object"
            ? (item as any).name ?? (item as any).title ?? (item as any).nome ?? ""
            : "";
        if (typeof text === "string") {
          result.push(...text.split(/[,;\n]+/).map((entry) => entry.trim()).filter(Boolean));
        }
      }
    };

    append(data.diagnoses ?? data.diagnosis ?? data.diagnosticos ?? data.anamnesis?.health?.diagnosis);

    if (typeof localStorage !== "undefined") {
      try {
        const saved = localStorage.getItem(`mindway-child-profile-${child.id}`);
        const parsed = saved ? JSON.parse(saved) : null;
        const diagnosticsSection = Array.isArray(parsed) ? parsed[1] : parsed?.sections?.[1];
        if (diagnosticsSection && typeof diagnosticsSection === "object") {
          for (const [label, value] of Object.entries(diagnosticsSection)) {
            const normalizedLabel = label.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
            const isDiagnosisField = normalizedLabel.includes("diagn")
              && !/(profissional|medic[oa]|responsavel|quem|nome)/.test(normalizedLabel);
            if (isDiagnosisField && typeof value === "string") append(value);
          }
        }
      } catch {
        // Keep diagnoses already supplied by the API when a local draft is invalid.
      }
    }

    return [...new Set(result)].slice(0, 4);
  }


  // =========================================================
  // CRIAÇÃO DA ANAMNESE
  // =========================================================

  onCreateAnamnesis(): void {

    if (!this.selectedChildId) {
      return;
    }

    this.anamnesisService
      .createAnamnesis(
        this.selectedChildId
      )
      .subscribe();
  }


  // =========================================================
  // NAVEGAÇÃO
  // =========================================================

  /**
   * Abre uma etapa.
   */
  openSection(
    section: AnamnesisSection
  ): void {

    if (!this.selectedChildId) {
      return;
    }


    this.activeSection =
      section;


    this.sectionWasSaved =
      this.anamnesisSnapshot
        ? this.isSectionCompleted(
            this.anamnesisSnapshot,
            section
          )
        : false;


    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }


  /**
   * Volta para a lista das 7 etapas.
   */
  closeSection(): void {

    this.activeSection = null;

    this.sectionWasSaved = false;


    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }


  /**
   * Continua preenchendo.
   */
  continueFilling(): void {

    const anamnesis =
      this.anamnesisSnapshot;


    if (!anamnesis) {

      this.openSection(
        "birth"
      );

      return;
    }


    const nextSection =
      this.sectionOrder.find(
        (section) =>
          !this.isSectionCompleted(
            anamnesis,
            section
          )
      );


    if (nextSection) {

      this.openSection(
        nextSection
      );

      return;
    }


    this.openSection(
      "generalNotes"
    );
  }


  /**
   * Compatibilidade com versões anteriores.
   */
  continueAnamnesis(): void {

    this.continueFilling();
  }


  /**
   * Vai para a próxima etapa.
   */
  goToNextSection(): void {

    if (!this.activeSection) {
      return;
    }


    const currentIndex =
      this.sectionOrder.indexOf(
        this.activeSection
      );


    const nextIndex =
      currentIndex + 1;


    if (
      nextIndex <
      this.sectionOrder.length
    ) {

      this.activeSection =
        this.sectionOrder[
          nextIndex
        ];


      this.sectionWasSaved =
        this.anamnesisSnapshot
          ? this.isSectionCompleted(
              this.anamnesisSnapshot,
              this.activeSection
            )
          : false;


      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }


    this.closeSection();
  }


  /**
   * VOLTA PARA A ETAPA ANTERIOR.
   */
  goToPreviousSection(): void {

    if (!this.activeSection) {
      return;
    }


    const currentIndex =
      this.sectionOrder.indexOf(
        this.activeSection
      );


    const previousIndex =
      currentIndex - 1;


    if (previousIndex >= 0) {

      this.activeSection =
        this.sectionOrder[
          previousIndex
        ];


      this.sectionWasSaved =
        this.anamnesisSnapshot
          ? this.isSectionCompleted(
              this.anamnesisSnapshot,
              this.activeSection
            )
          : false;


      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }


    /**
     * Se já estiver na primeira etapa,
     * retorna para as 7 etapas.
     */
    this.closeSection();
  }


  /**
   * Finaliza a navegação.
   */
  finishAnamnesis(): void {

    this.closeSection();
  }


  /**
   * Texto da próxima etapa.
   */
  getNextSectionLabel(
    anamnesis:
      | AnamnesisRecord
      | null
  ): string {

    if (!anamnesis) {

      return "Gestação e nascimento";
    }


    const nextSection =
      this.sectionOrder.find(
        (section) =>
          !this.isSectionCompleted(
            anamnesis,
            section
          )
      );


    if (!nextSection) {

      return "Anamnese concluída";
    }


    return this.sectionLabels[
      nextSection
    ];
  }


  // =========================================================
  // VERIFICAÇÃO DAS ETAPAS
  // =========================================================

  isSectionCompleted(
    anamnesis: AnamnesisRecord,
    section: AnamnesisSection
  ): boolean {

    switch (section) {

      case "birth":

        return Boolean(
          anamnesis.birth
        );


      case "motorDevelopment":

        return Boolean(
          anamnesis.motorDevelopment
        );


      case "languageCommunication":

        return Boolean(
          anamnesis.languageCommunication
        );


      case "health":

        return Boolean(
          anamnesis.health
        );


      case "behavior":

        return Boolean(
          anamnesis.behavior
        );


      case "routine":

        return Boolean(
          anamnesis.routine
        );


      case "generalNotes":

        return Boolean(
          anamnesis.generalNotes?.trim()
        );


      default:

        return false;
    }
  }


  // =========================================================
  // GESTAÇÃO E NASCIMENTO
  // =========================================================

  onSaveBirth(
    payload: UpsertAnamnesisBirthDTO
  ): void {

    if (!this.selectedChildId) {
      return;
    }


    this.anamnesisService
      .upsertBirth(
        this.selectedChildId,
        payload,
        Boolean(
          this.anamnesisSnapshot?.birth
        )
      )
      .subscribe({

        next: () => {

          this.sectionWasSaved =
            true;

        },

      });
  }


  onDeleteBirth(): void {

    if (!this.selectedChildId) {
      return;
    }


    if (
      !confirm(
        "Tem certeza de que deseja excluir a seção de nascimento?"
      )
    ) {
      return;
    }


    this.anamnesisService
      .deleteBirth(
        this.selectedChildId
      )
      .subscribe();
  }


  // =========================================================
  // DESENVOLVIMENTO MOTOR
  // =========================================================

  onSaveMotorDevelopment(
    payload:
      UpsertAnamnesisMotorDevelopmentDTO
  ): void {

    if (!this.selectedChildId) {
      return;
    }


    this.anamnesisService
      .upsertMotorDevelopment(
        this.selectedChildId,
        payload,
        Boolean(
          this.anamnesisSnapshot
            ?.motorDevelopment
        )
      )
      .subscribe({

        next: () => {

          this.sectionWasSaved =
            true;

        },

      });
  }


  onDeleteMotorDevelopment(): void {

    if (!this.selectedChildId) {
      return;
    }


    if (
      !confirm(
        "Tem certeza de que deseja excluir a seção de desenvolvimento motor?"
      )
    ) {
      return;
    }


    this.anamnesisService
      .deleteMotorDevelopment(
        this.selectedChildId
      )
      .subscribe();
  }


  // =========================================================
  // LINGUAGEM E COMUNICAÇÃO
  // =========================================================

  onSaveLanguageCommunication(
    payload:
      UpsertAnamnesisLanguageCommunicationDTO
  ): void {

    if (!this.selectedChildId) {
      return;
    }


    this.anamnesisService
      .upsertLanguageCommunication(
        this.selectedChildId,
        payload,
        Boolean(
          this.anamnesisSnapshot
            ?.languageCommunication
        )
      )
      .subscribe({

        next: () => {

          this.sectionWasSaved =
            true;

        },

      });
  }


  onDeleteLanguageCommunication(): void {

    if (!this.selectedChildId) {
      return;
    }


    if (
      !confirm(
        "Tem certeza de que deseja excluir a seção de linguagem e comunicação?"
      )
    ) {
      return;
    }


    this.anamnesisService
      .deleteLanguageCommunication(
        this.selectedChildId
      )
      .subscribe();
  }


  // =========================================================
  // SAÚDE
  // =========================================================

  onSaveHealth(
    payload: UpsertAnamnesisHealthDTO
  ): void {

    if (!this.selectedChildId) {
      return;
    }


    this.anamnesisService
      .upsertHealth(
        this.selectedChildId,
        payload,
        Boolean(
          this.anamnesisSnapshot?.health
        )
      )
      .subscribe({

        next: () => {

          this.sectionWasSaved =
            true;

        },

      });
  }


  onDeleteHealth(): void {

    if (!this.selectedChildId) {
      return;
    }


    if (
      !confirm(
        "Tem certeza de que deseja excluir a seção de saúde?"
      )
    ) {
      return;
    }


    this.anamnesisService
      .deleteHealth(
        this.selectedChildId
      )
      .subscribe();
  }


  // =========================================================
  // COMPORTAMENTO
  // =========================================================

  onSaveBehavior(
    payload: UpsertAnamnesisBehaviorDTO
  ): void {

    if (!this.selectedChildId) {
      return;
    }


    this.anamnesisService
      .upsertBehavior(
        this.selectedChildId,
        payload,
        Boolean(
          this.anamnesisSnapshot?.behavior
        )
      )
      .subscribe({

        next: () => {

          this.sectionWasSaved =
            true;

        },

      });
  }


  onDeleteBehavior(): void {

    if (!this.selectedChildId) {
      return;
    }


    if (
      !confirm(
        "Tem certeza de que deseja excluir a seção de comportamento?"
      )
    ) {
      return;
    }


    this.anamnesisService
      .deleteBehavior(
        this.selectedChildId
      )
      .subscribe();
  }


  // =========================================================
  // ROTINA E ACOMPANHAMENTO
  // =========================================================

  onSaveRoutine(
    payload: UpsertAnamnesisRoutineDTO
  ): void {

    if (!this.selectedChildId) {
      return;
    }


    this.anamnesisService
      .upsertRoutine(
        this.selectedChildId,
        payload,
        Boolean(
          this.anamnesisSnapshot?.routine
        )
      )
      .subscribe({

        next: () => {

          this.sectionWasSaved =
            true;

        },

      });
  }


  onDeleteRoutine(): void {

    if (!this.selectedChildId) {
      return;
    }


    if (
      !confirm(
        "Tem certeza de que deseja excluir a seção de rotina?"
      )
    ) {
      return;
    }


    this.anamnesisService
      .deleteRoutine(
        this.selectedChildId
      )
      .subscribe();
  }


  // =========================================================
  // OBSERVAÇÕES GERAIS
  // =========================================================

  onSaveGeneralNotes(
    payload: UpdateAnamnesisGeneralNotesDTO
  ): void {

    if (!this.selectedChildId) {
      return;
    }


    this.anamnesisService
      .updateGeneralNotes(
        this.selectedChildId,
        payload
      )
      .subscribe({

        next: () => {

          this.sectionWasSaved =
            true;

        },

      });
  }


  // =========================================================
  // TRACKBY
  // =========================================================

  trackChildById(
    _index: number,
    child: ChildRecord
  ): string {

    return child.id;
  }


  // =========================================================
  // RESUMO
  // =========================================================

  private buildOverview(
    child: ChildRecord | null,
    anamnesis:
      | AnamnesisRecord
      | null
  ): {
    child: ChildRecord | null;
    completedSections: number;
    totalSections: number;
    hasAnamnesis: boolean;
  } {

    const totalSections =
      this.sectionOrder.length;


    /**
     * Ainda não existe anamnese.
     */
    if (!anamnesis) {

      return {

        child,

        completedSections: 0,

        totalSections,

        hasAnamnesis: false,

      };
    }


    /**
     * Conta somente as etapas preenchidas.
     */
    const completedSections =
      this.sectionOrder.filter(
        (section) =>
          this.isSectionCompleted(
            anamnesis,
            section
          )
      ).length;


    return {

      child,

      completedSections,

      totalSections,

      hasAnamnesis: true,

    };
  }
}
