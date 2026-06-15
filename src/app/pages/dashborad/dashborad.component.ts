import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { map } from "rxjs";
import type { UserRole } from "../../api/interfaces/user.interface";
import { AuthService } from "../../services/auth.service";

interface DashboardAction {
  icon: string;
  label: string;
  description: string;
  route: string;
}

interface DashboardTip {
  icon: string;
  title: string;
  description: string;
}

interface DashboardProfile {
  roleLabel: string;
  eyebrow: string;
  title: string;
  description: string;
  focusTitle: string;
  focusDescription: string;
  primaryActionLabel: string;
  primaryActionRoute: string;
  actions: DashboardAction[];
  tips: DashboardTip[];
}

interface DashboardViewModel extends DashboardProfile {
  displayName: string;
}

const dashboardProfiles: Record<UserRole | "default", DashboardProfile> = {
  common: {
    roleLabel: "Responsável",
    eyebrow: "Visão da família",
    title: "Acompanhe tudo com calma e clareza.",
    description:
      "Use este painel como ponto de partida para consultar informações da criança, atualizar observações e compartilhar dados importantes com a rede de apoio.",
    focusTitle: "Comece pelo perfil da criança",
    focusDescription:
      "Confira idade, nascimento e observações antes de preencher relatórios ou anamneses. Assim você evita registrar informações no lugar errado.",
    primaryActionLabel: "Ver crianças",
    primaryActionRoute: "/child-profile",
    actions: [
      {
        icon: "bi-person-hearts",
        label: "Perfil da criança",
        description: "Veja dados essenciais e selecione a criança certa.",
        route: "/child-profile",
      },
      {
        icon: "bi-clipboard2-pulse",
        label: "Anamnese",
        description: "Atualize histórico, rotina, saúde e desenvolvimento.",
        route: "/anamnesis",
      },
      {
        icon: "bi-file-earmark-text",
        label: "Relatórios",
        description: "Leia registros criados pela rede de apoio.",
        route: "/reports-child",
      },
    ],
    tips: [
      {
        icon: "bi-check2-circle",
        title: "Selecione a criança antes de agir",
        description: "Isso ajuda a manter cada registro vinculado ao perfil correto.",
      },
      {
        icon: "bi-chat-left-heart",
        title: "Registre fatos simples",
        description: "Prefira observações objetivas, com data e contexto.",
      },
      {
        icon: "bi-shield-check",
        title: "Compartilhe com cuidado",
        description: "Inclua apenas informações úteis para o acompanhamento.",
      },
    ],
  },
  therapist: {
    roleLabel: "Terapeuta",
    eyebrow: "Acompanhamento terapêutico",
    title: "Organize a evolução com registros consistentes.",
    description:
      "Acesse crianças vinculadas, consulte histórico e registre recomendações de forma clara para responsáveis, escola e outros profissionais.",
    focusTitle: "Priorize registros objetivos",
    focusDescription:
      "Antes de criar um relatório, revise a anamnese e descreva comportamento, dificuldade e recomendação com linguagem acessível.",
    primaryActionLabel: "Criar relatório",
    primaryActionRoute: "/reports-child",
    actions: [
      {
        icon: "bi-search-heart",
        label: "Consultar criança",
        description: "Encontre o perfil vinculado ao seu atendimento.",
        route: "/child-profile",
      },
      {
        icon: "bi-clipboard2-pulse",
        label: "Revisar anamnese",
        description: "Veja histórico clínico, rotina e desenvolvimento.",
        route: "/anamnesis",
      },
      {
        icon: "bi-journal-medical",
        label: "Relatórios",
        description: "Crie devolutivas e recomendações profissionais.",
        route: "/reports-child",
      },
    ],
    tips: [
      {
        icon: "bi-lightbulb",
        title: "Use linguagem prática",
        description: "Escreva recomendações que a família consiga aplicar no dia a dia.",
      },
      {
        icon: "bi-clock-history",
        title: "Compare com registros anteriores",
        description: "Observe padrões antes de definir próximos passos.",
      },
      {
        icon: "bi-people",
        title: "Alinhe a rede de apoio",
        description: "Inclua escola e responsáveis quando a orientação depender do ambiente.",
      },
    ],
  },
  enterprise: {
    roleLabel: "Escola ou clínica",
    eyebrow: "Gestão institucional",
    title: "Centralize o acompanhamento sem excesso de informação.",
    description:
      "Use o painel para consultar crianças associadas, acompanhar relatórios e apoiar a comunicação entre equipe, família e profissionais.",
    focusTitle: "Mantenha a equipe alinhada",
    focusDescription:
      "Consulte registros recentes e direcione cada informação para quem realmente precisa dela.",
    primaryActionLabel: "Ver perfis vinculados",
    primaryActionRoute: "/child-profile",
    actions: [
      {
        icon: "bi-people",
        label: "Crianças vinculadas",
        description: "Acesse perfis associados à instituição.",
        route: "/child-profile",
      },
      {
        icon: "bi-file-earmark-check",
        label: "Relatórios",
        description: "Acompanhe registros e orientações da rede.",
        route: "/reports-child",
      },
      {
        icon: "bi-person-badge",
        label: "Perfil",
        description: "Revise os dados da conta institucional.",
        route: "/profile",
      },
    ],
    tips: [
      {
        icon: "bi-diagram-3",
        title: "Defina responsáveis por informação",
        description: "Evite duplicidade combinando quem registra cada tipo de dado.",
      },
      {
        icon: "bi-eye",
        title: "Mostre somente o necessário",
        description: "Informações sensíveis devem aparecer apenas quando forem úteis.",
      },
      {
        icon: "bi-calendar2-check",
        title: "Revise registros periodicamente",
        description: "Uma rotina simples ajuda a manter o acompanhamento atualizado.",
      },
    ],
  },
  professional: {
    roleLabel: "Profissional",
    eyebrow: "Atuação colaborativa",
    title: "Contribua com observações úteis para a equipe.",
    description:
      "Professores, fisioterapeutas e profissionais relacionados podem registrar percepções do cotidiano e consultar orientações importantes.",
    focusTitle: "Registre o que você observou",
    focusDescription:
      "Uma boa anotação descreve o contexto, o comportamento observado e o impacto na rotina da criança.",
    primaryActionLabel: "Adicionar relatório",
    primaryActionRoute: "/reports-child",
    actions: [
      {
        icon: "bi-person-check",
        label: "Perfil da criança",
        description: "Confira dados básicos antes de registrar algo.",
        route: "/child-profile",
      },
      {
        icon: "bi-pencil-square",
        label: "Novo registro",
        description: "Compartilhe observações com a rede de apoio.",
        route: "/reports-child",
      },
      {
        icon: "bi-clipboard-data",
        label: "Anamnese",
        description: "Consulte informações que ajudam no cuidado diário.",
        route: "/anamnesis",
      },
    ],
    tips: [
      {
        icon: "bi-card-checklist",
        title: "Seja específico",
        description: "Troque avaliações genéricas por exemplos concretos do cotidiano.",
      },
      {
        icon: "bi-arrow-repeat",
        title: "Observe padrões",
        description: "Repetições podem revelar gatilhos, facilidades ou necessidades.",
      },
      {
        icon: "bi-chat-square-text",
        title: "Facilite a leitura",
        description: "Escreva para que família, escola e terapeutas entendam rapidamente.",
      },
    ],
  },
  admin: {
    roleLabel: "Administrador",
    eyebrow: "Painel administrativo",
    title: "Acompanhe a operação com foco no cuidado.",
    description:
      "Use este espaço para navegar rapidamente pelas áreas principais e apoiar usuários quando necessário.",
    focusTitle: "Revise fluxos essenciais",
    focusDescription:
      "Perfis, anamneses e relatórios devem permanecer fáceis de encontrar e seguros para cada usuário.",
    primaryActionLabel: "Ir para perfis",
    primaryActionRoute: "/child-profile",
    actions: [
      {
        icon: "bi-person-lines-fill",
        label: "Perfis",
        description: "Acesse crianças e informações associadas.",
        route: "/child-profile",
      },
      {
        icon: "bi-clipboard2-pulse",
        label: "Anamneses",
        description: "Consulte dados estruturados de acompanhamento.",
        route: "/anamnesis",
      },
      {
        icon: "bi-file-earmark-text",
        label: "Relatórios",
        description: "Veja registros feitos pelos usuários.",
        route: "/reports-child",
      },
    ],
    tips: [
      {
        icon: "bi-shield-lock",
        title: "Preserve acesso mínimo",
        description: "Cada usuário deve visualizar apenas o que precisa.",
      },
      {
        icon: "bi-speedometer2",
        title: "Monitore pontos de atrito",
        description: "Telas vazias e estados confusos merecem prioridade.",
      },
      {
        icon: "bi-life-preserver",
        title: "Apoie a rede",
        description: "Ajude responsáveis e profissionais a encontrarem o caminho certo.",
      },
    ],
  },
  default: {
    roleLabel: "Usuário",
    eyebrow: "Painel MindWay",
    title: "Bem-vindo(a) ao seu espaço de acompanhamento.",
    description:
      "Aqui você encontra atalhos para consultar perfis, anamneses e relatórios com mais segurança.",
    focusTitle: "Escolha uma área para começar",
    focusDescription:
      "Se tiver dúvida, comece pelo perfil da criança para confirmar que está trabalhando com as informações corretas.",
    primaryActionLabel: "Ver crianças",
    primaryActionRoute: "/child-profile",
    actions: [
      {
        icon: "bi-person-hearts",
        label: "Perfis",
        description: "Consulte informações básicas da criança.",
        route: "/child-profile",
      },
      {
        icon: "bi-clipboard2-pulse",
        label: "Anamnese",
        description: "Veja dados importantes do histórico.",
        route: "/anamnesis",
      },
      {
        icon: "bi-file-earmark-text",
        label: "Relatórios",
        description: "Acompanhe registros compartilhados.",
        route: "/reports-child",
      },
    ],
    tips: [
      {
        icon: "bi-check2-circle",
        title: "Confira antes de registrar",
        description: "Garanta que a criança correta esteja selecionada.",
      },
      {
        icon: "bi-lock",
        title: "Cuide dos dados",
        description: "Use somente informações necessárias ao acompanhamento.",
      },
      {
        icon: "bi-compass",
        title: "Navegue pelos atalhos",
        description: "Eles ajudam você a chegar rapidamente às áreas principais.",
      },
    ],
  },
};

@Component({
  selector: "app-dashborad",
  standalone: false,
  templateUrl: "./dashborad.component.html",
  styleUrl: "./dashborad.component.css",
})
export class DashboradComponent {
  readonly viewModel$ = this.authService.currentUser$.pipe(
    map((user): DashboardViewModel => {
      const profile = dashboardProfiles[user?.role ?? "default"] ?? dashboardProfiles.default;

      return {
        ...profile,
        displayName: user?.name?.trim() || user?.email?.trim() || "seja bem-vindo(a)",
      };
    })
  );

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  navigateTo(route: string): void {
    void this.router.navigate([route]);
  }
}
