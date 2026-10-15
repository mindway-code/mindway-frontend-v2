import { Component, DestroyRef, OnInit, inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, Validators } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { switchMap, take } from "rxjs";
import { AuthService } from "../../services/auth.service";
import { UserService } from "../../services/user.service";
import { ChildService } from "../../services/child.service";
import type { UserRecord, UserRole } from "../../api/interfaces/user.interface";
import type { ChildRecord } from "../../api/interfaces/child.interface";

type SettingsSection = "account" | "security" | "notifications" | "connections" | "privacy";
type NotificationPreferences = Record<"messages" | "reports" | "anamnesis" | "professionalNotes" | "email" | "whatsapp" | "inApp", boolean>;
type ConnectionTab = "professionals" | "school" | "other" | "pending";
type LegalDocumentType = "terms" | "privacy";
interface LegalSectionText { title: string; paragraphs: string[]; }
interface LegalAcceptanceRecord { termsAcceptedAt: string; privacyAcceptedAt: string; termsVersion: string; privacyVersion: string; }
interface ConnectionInvite {
  id: string;
  childId: string;
  childName: string;
  category: "professionals" | "school" | "other";
  type: string;
  specialty: string;
  name: string;
  email: string;
  institution: string;
  code: string;
  link: string;
  createdAt: string;
  status: "Pendente";
}
interface SupportContact { name: string; description: string; pending: boolean; }

const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  messages: true,
  reports: true,
  anamnesis: false,
  professionalNotes: true,
  email: true,
  whatsapp: true,
  inApp: true,
};

@Component({
  selector: "app-settings",
  standalone: false,
  templateUrl: "./settings.component.html",
  styleUrl: "./settings.component.scss",
})
export class SettingsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  readonly today = new Date();
  readonly currentUser$ = this.authService.currentUser$;
  readonly children$ = this.childService.children$;
  readonly saving$ = this.userService.saving$;
  readonly sectionTitles: Record<SettingsSection, string> = {
    account: "Dados da conta",
    security: "Segurança",
    notifications: "Notificações",
    connections: "Rede de Apoio",
    privacy: "Termos e política de privacidade",
  };

  activeSection: SettingsSection | null = null;
  accountMessage = "";
  accountMessageDismissed = false;
  profilePhoto: string | null = null;
  phoneNumber = "";
  private accountUser: UserRecord | null = null;
  passwordMessage = "";
  notificationMessage = "";
  preferences: NotificationPreferences = { ...DEFAULT_NOTIFICATIONS };
  whatsappNumber = "";
  selectedConnectionChild: ChildRecord | null = null;
  connectionTab: ConnectionTab = "professionals";
  showInviteDialog = false;
  connectionMessage = "";
  inviteType = "Profissional de saúde";
  inviteSpecialty = "";
  inviteName = "";
  inviteEmail = "";
  inviteInstitution = "";
  inviteWithCode = true;
  connectionInvites: ConnectionInvite[] = [];
  legalDocument: LegalDocumentType | null = null;
  legalAcceptanceStep: LegalDocumentType | "success" | null = null;
  legalAcceptanceRecord: LegalAcceptanceRecord | null = null;
  legalAcceptanceChecked = false;
  legalAcceptanceMessage = "";
  private pendingTermsAcceptedAt = "";
  readonly legalVersion = "1.0";
  readonly legalUpdatedAt = new Date(2026, 9, 1);
  readonly legalContent: Record<LegalDocumentType, LegalSectionText[]> = {
    terms: [
      { title: "Sobre o MindWay", paragraphs: ["O MindWay é uma plataforma para organizar informações relacionadas ao acompanhamento e desenvolvimento infantil, conectando responsáveis, profissionais de saúde e instituições de ensino."] },
      { title: "Aceitação dos termos", paragraphs: ["Ao utilizar a plataforma, você declara que leu e compreendeu estes termos e as informações da Política de privacidade."] },
      { title: "Uso da plataforma", paragraphs: ["Use o MindWay apenas para finalidades legítimas relacionadas ao acompanhamento da criança. Mantenha os dados fornecidos corretos e atualizados."] },
      { title: "Contas e segurança", paragraphs: ["Você é responsável por proteger suas credenciais e pelas atividades realizadas em sua conta. Avise a equipe responsável caso suspeite de uso indevido."] },
      { title: "Permissões de acesso", paragraphs: ["O acesso às informações da criança deve ser concedido somente a pessoas autorizadas pelo responsável, de acordo com as funcionalidades disponíveis na plataforma."] },
    ],
    privacy: [
      { title: "Quais dados coletamos", paragraphs: ["Podem ser tratados dados da conta do responsável, dados cadastrais da criança, informações de anamnese, relatórios e dados de profissionais vinculados."] },
      { title: "Como utilizamos os dados", paragraphs: ["Os dados apoiam a organização das informações e o acompanhamento da criança por responsáveis e pessoas autorizadas."] },
      { title: "Compartilhamento de dados", paragraphs: ["As informações da criança devem ser compartilhadas apenas com pessoas autorizadas pelo responsável, conforme os acessos habilitados na plataforma."] },
      { title: "Segurança da informação", paragraphs: ["São adotadas medidas técnicas e organizacionais para proteger os dados contra acesso não autorizado, perda ou alteração indevida."] },
      { title: "Seus direitos", paragraphs: ["O titular ou responsável pode solicitar acesso, correção ou exclusão de dados pessoais, observadas as obrigações legais aplicáveis."] },
    ],
  };
  readonly professionalTypes = ["Profissional de saúde", "Terapeuta"];
  readonly specialties = ["Neuropediatra", "Psicólogo(a)", "Terapeuta ocupacional", "Fonoaudiólogo(a)", "Fisioterapeuta", "Outro"];
  readonly notificationItems = [
    { key: "messages" as const, title: "Novas mensagens", description: "Receba avisos quando houver novas mensagens." },
    { key: "reports" as const, title: "Novos relatórios", description: "Receba avisos quando um relatório for compartilhado." },
    { key: "anamnesis" as const, title: "Atualizações da anamnese", description: "Receba avisos sobre alterações na anamnese." },
    { key: "professionalNotes" as const, title: "Anotações profissionais", description: "Receba avisos sobre novas anotações da equipe." },
  ];
  readonly deliveryItems = [
    { key: "email" as const, title: "E-mail", description: "Preferência de recebimento por e-mail." },
    { key: "inApp" as const, title: "Notificações no sistema", description: "Preferência de avisos dentro da plataforma." },
  ];

  readonly accountForm = this.fb.group({
    name: ["", [Validators.required, Validators.minLength(2)]],
    email: ["", [Validators.required, Validators.email]],
  });
  readonly passwordForm = this.fb.group({
    currentPassword: ["", Validators.required],
    newPassword: ["", [Validators.required, Validators.minLength(8)]],
    confirmPassword: ["", Validators.required],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly childService: ChildService,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const section = params.get("section") as SettingsSection | null;
      this.activeSection = section && section in this.sectionTitles ? section : null;
    });
    this.currentUser$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((user) => {
      if (user) {
        this.accountUser = user;
        this.loadLegalAcceptance(user.id);
        this.accountForm.patchValue({ name: user.name ?? "", email: user.email ?? "" }, { emitEvent: false });
        this.phoneNumber = localStorage.getItem(`mindway-account-phone-${user.id}`) ?? "";
        this.profilePhoto = localStorage.getItem(`mindway-account-photo-${user.id}`);
      }
    });
    this.childService.loadAccessibleChildren({ page: 1, pageSize: 50 }).pipe(take(1)).subscribe({ error: () => {} });
    this.loadNotificationPreferences();
    this.loadConnectionInvites();
  }

  openSection(section: SettingsSection): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: { section } });
    this.legalDocument = null;
    this.legalAcceptanceStep = null;
    this.accountMessage = "";
    this.passwordMessage = "";
    this.notificationMessage = "";
  }

  backToSettings(): void {
    this.legalDocument = null;
    this.legalAcceptanceStep = null;
    void this.router.navigate([], { relativeTo: this.route, queryParams: { section: null } });
  }

  roleLabel(role: UserRole | null | undefined): string {
    const labels: Record<UserRole, string> = {
      admin: "Administrador",
      common: "Responsável",
      enterprise: "Escola ou instituição",
      professional: "Profissional",
      therapist: "Terapeuta",
    };
    return role ? labels[role] : "Usuário";
  }

  initials(user: UserRecord | null): string {
    return (user?.name || user?.email || "U").trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  }

  saveAccount(): void {
    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      return;
    }
    const value = this.accountForm.getRawValue();
    const user = this.accountUser;
    this.userService.updateMe({ name: value.name?.trim() || undefined, email: value.email?.trim() || undefined }).pipe(
      switchMap(() => this.authService.loadCurrentUser()),
      take(1),
    ).subscribe({
      next: () => {
        if (user) localStorage.setItem(`mindway-account-phone-${user.id}`, this.phoneNumber.trim());
        this.accountMessage = "Dados da conta atualizados com sucesso!";
        this.accountMessageDismissed = false;
      },
      error: () => this.accountMessage = "Não foi possível salvar os dados. Confira as informações e tente novamente.",
    });
  }

  onProfilePhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.profilePhoto = String(reader.result);
      const user = this.accountUser;
      if (user) localStorage.setItem(`mindway-account-photo-${user.id}`, this.profilePhoto!);
    };
    reader.readAsDataURL(file);
    input.value = "";
  }

  removeProfilePhoto(): void {
    this.profilePhoto = null;
    const user = this.accountUser;
    if (user) localStorage.removeItem(`mindway-account-photo-${user.id}`);
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.getRawValue();
    if (newPassword !== confirmPassword) {
      this.passwordMessage = "A nova senha e a confirmação estão diferentes.";
      return;
    }
    this.userService.changePassword(currentPassword ?? "", newPassword ?? "").pipe(take(1)).subscribe({
      next: () => {
        this.passwordForm.reset();
        this.passwordMessage = "Senha alterada com sucesso.";
      },
      error: () => this.passwordMessage = "A senha atual não confere ou ocorreu um erro. Tente novamente.",
    });
  }

  togglePreference(key: keyof NotificationPreferences): void {
    this.preferences = { ...this.preferences, [key]: !this.preferences[key] };
    this.notificationMessage = "";
  }

  saveNotificationPreferences(): void {
    try {
      localStorage.setItem("mindway-notification-preferences", JSON.stringify(this.preferences));
      localStorage.setItem("mindway-notification-whatsapp", this.whatsappNumber.trim());
      this.notificationMessage = "Preferências salvas neste navegador.";
    } catch {
      this.notificationMessage = "Não foi possível salvar as preferências neste navegador.";
    }
  }

  goToProfile(): void {
    void this.router.navigate(["/profile"]);
  }

  selectConnectionChild(child: ChildRecord): void {
    this.selectedConnectionChild = child;
    this.connectionTab = "professionals";
    this.connectionMessage = "";
  }

  getCurrentConnectionChild(children: ChildRecord[]): ChildRecord | null {
    return this.selectedConnectionChild ?? children[0] ?? null;
  }

  selectConnectionChildById(childId: string, children: ChildRecord[]): void {
    const child = children.find((item) => item.id === childId) ?? children[0];
    if (child) this.selectConnectionChild(child);
  }

  childFirstName(child: ChildRecord): string {
    return child.name.trim().split(/\s+/)[0] || child.name;
  }

  connectionInvitesFor(category: ConnectionTab, childId?: string): ConnectionInvite[] {
    const selectedChildId = this.selectedConnectionChild?.id ?? childId;
    if (!selectedChildId) return [];
    return this.connectionInvites.filter((invite) => invite.childId === selectedChildId && (category === "pending" || invite.category === category));
  }

  getNetworkContacts(child: ChildRecord, category: Exclude<ConnectionTab, "pending">): SupportContact[] {
    const contacts: SupportContact[] = this.connectionInvitesFor(category, child.id).map((invite) => ({
      name: invite.name,
      description: [invite.specialty || invite.type, invite.institution].filter(Boolean).join(" · "),
      pending: true,
    }));
    if (category !== "other" && typeof localStorage !== "undefined") {
      try {
        const saved = localStorage.getItem(`mindway-child-profile-${child.id}`);
        const profile = saved ? JSON.parse(saved) : null;
        const sections = Array.isArray(profile) ? profile : profile?.sections ?? [];
        if (category === "professionals") {
          const providers = Array.isArray(profile?.careProviders) ? profile.careProviders : [];
          for (const provider of providers) {
            const name = String(provider.professional || provider.clinic || "").trim();
            if (!name) continue;
            contacts.push({ name, description: [provider.specialty, provider.type, provider.clinic && provider.professional ? provider.clinic : ""].filter(Boolean).join(" · "), pending: false });
          }
        } else {
          const schoolFields = sections[4] && typeof sections[4] === "object" ? Object.entries(sections[4]) : [];
          for (const [label, value] of schoolFields) {
            if (typeof value !== "string" || !value.trim()) continue;
            const normalized = label.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
            if (/(escola|professora|coordenacao)/.test(normalized)) contacts.push({ name: value.trim(), description: label, pending: false });
          }
        }
      } catch {
        // Keep invitation contacts when a local profile cannot be read.
      }
    }
    const seen = new Set<string>();
    return contacts.filter((contact) => {
      const key = contact.name.toLocaleLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  openInviteDialog(category: Exclude<ConnectionTab, "pending"> = "professionals", child?: ChildRecord): void {
    if (child) this.selectedConnectionChild = child;
    this.connectionTab = category;
    this.inviteType = category === "school" ? "Escola" : category === "other" ? "Outro apoio" : "Profissional de saúde";
    this.inviteSpecialty = "";
    this.inviteName = "";
    this.inviteEmail = "";
    this.inviteInstitution = "";
    this.inviteWithCode = true;
    this.showInviteDialog = true;
  }

  createConnectionInvite(): void {
    if (!this.selectedConnectionChild || !this.inviteName.trim() || !this.inviteEmail.trim()) return;
    const code = this.inviteWithCode ? `MW-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}` : "";
    const category: ConnectionInvite["category"] = this.inviteType === "Escola" ? "school" : this.inviteType === "Outro apoio" ? "other" : "professionals";
    const invite: ConnectionInvite = {
      id: `${Date.now()}`,
      childId: this.selectedConnectionChild.id,
      childName: this.selectedConnectionChild.name,
      category,
      type: this.inviteType,
      specialty: this.inviteSpecialty,
      name: this.inviteName.trim(),
      email: this.inviteEmail.trim(),
      institution: this.inviteInstitution.trim(),
      code,
      link: code ? `${window.location.origin}/convite/${code}` : "",
      createdAt: new Date().toLocaleDateString("pt-BR"),
      status: "Pendente",
    };
    this.connectionInvites = [invite, ...this.connectionInvites];
    this.persistConnectionInvites();
    this.connectionTab = "pending";
    this.showInviteDialog = false;
    this.connectionMessage = "Convite gerado com sucesso! Compartilhe o link ou o código com o profissional.";
  }

  async copyConnectionInvite(value: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      this.connectionMessage = "Link ou código copiado.";
    } catch {
      this.connectionMessage = "Não foi possível copiar automaticamente. Selecione e copie o texto.";
    }
  }

  closeConnectionChild(): void {
    this.selectedConnectionChild = null;
    this.connectionMessage = "";
  }

  openLegalDocument(document: LegalDocumentType): void {
    this.legalDocument = this.legalAcceptanceRecord ? document : "terms";
    this.legalAcceptanceChecked = false;
    this.legalAcceptanceMessage = "";
    this.legalAcceptanceStep = this.legalAcceptanceRecord ? null : "terms";
  }

  closeLegalDocument(): void {
    this.legalDocument = null;
    this.legalAcceptanceStep = null;
    this.legalAcceptanceMessage = "";
  }

  saveAndContinueLegalAcceptance(): void {
    if (!this.legalAcceptanceChecked) {
      this.legalAcceptanceMessage = "Marque a caixa para confirmar o aceite deste documento.";
      return;
    }
    if (this.legalAcceptanceStep === "terms") {
      this.pendingTermsAcceptedAt = new Date().toISOString();
      this.legalDocument = "privacy";
      this.legalAcceptanceStep = "privacy";
      this.legalAcceptanceChecked = false;
      this.legalAcceptanceMessage = "";
      return;
    }
    if (this.legalAcceptanceStep !== "privacy" || !this.accountUser) return;
    const acceptedAt = new Date().toISOString();
    const record: LegalAcceptanceRecord = {
      termsAcceptedAt: this.pendingTermsAcceptedAt || acceptedAt,
      privacyAcceptedAt: acceptedAt,
      termsVersion: this.legalVersion,
      privacyVersion: this.legalVersion,
    };
    try {
      localStorage.setItem(`mindway-legal-acceptance-${this.accountUser.id}`, JSON.stringify(record));
      this.legalAcceptanceRecord = record;
      this.legalDocument = null;
      this.legalAcceptanceStep = "success";
      this.legalAcceptanceChecked = false;
      this.legalAcceptanceMessage = "";
    } catch {
      this.legalAcceptanceMessage = "Não foi possível registrar o aceite neste navegador. Tente novamente.";
    }
  }

  private loadLegalAcceptance(userId: string): void {
    try {
      const saved = localStorage.getItem(`mindway-legal-acceptance-${userId}`);
      const record = saved ? JSON.parse(saved) as LegalAcceptanceRecord : null;
      this.legalAcceptanceRecord = record?.termsVersion === this.legalVersion && record?.privacyVersion === this.legalVersion ? record : null;
    } catch {
      this.legalAcceptanceRecord = null;
    }
  }

  legalDocumentTitle(): string {
    return this.legalDocument === "terms" ? "Termos de uso" : "Política de privacidade";
  }

  printLegalDocument(): void {
    if (!this.legalDocument) return;
    const title = this.legalDocumentTitle();
    const sections = this.legalContent[this.legalDocument]
      .map((section) => `<section><h2>${section.title}</h2>${section.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("")}</section>`)
      .join("");
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;
    printWindow.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${title} - MindWay</title><style>body{font:15px/1.6 Arial,sans-serif;color:#193654;max-width:800px;margin:40px auto;padding:0 24px}h1{font-size:26px}h2{font-size:17px;margin:24px 0 6px}p{margin:0 0 8px;color:#536b81}.date{color:#71849a;font-size:13px}</style></head><body><h1>${title}</h1><p class="date">Última atualização: ${this.legalUpdatedAt.toLocaleDateString("pt-BR")}</p>${sections}<script>window.onload=()=>window.print()</script></body></html>`);
    printWindow.document.close();
  }

  private loadNotificationPreferences(): void {
    try {
      const saved = localStorage.getItem("mindway-notification-preferences");
      if (saved) this.preferences = { ...DEFAULT_NOTIFICATIONS, ...JSON.parse(saved) };
      this.whatsappNumber = localStorage.getItem("mindway-notification-whatsapp") ?? "";
    } catch {
      this.preferences = { ...DEFAULT_NOTIFICATIONS };
    }
  }

  private loadConnectionInvites(): void {
    try {
      this.connectionInvites = JSON.parse(localStorage.getItem("mindway-connection-invites") ?? "[]") as ConnectionInvite[];
    } catch {
      this.connectionInvites = [];
    }
  }

  private persistConnectionInvites(): void {
    try {
      localStorage.setItem("mindway-connection-invites", JSON.stringify(this.connectionInvites));
    } catch {
      this.connectionMessage = "O convite foi criado, mas não foi possível salvá-lo neste navegador.";
    }
  }
}
