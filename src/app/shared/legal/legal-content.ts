export type LegalDocumentType = 'terms' | 'privacy';

export interface LegalSectionText {
  title: string;
  paragraphs: string[];
}

export interface LegalAcceptanceRecord {
  termsAcceptedAt: string;
  privacyAcceptedAt: string;
  termsVersion: string;
  privacyVersion: string;
}

export const LEGAL_VERSION = '1.0';
export const LEGAL_UPDATED_AT = new Date(2026, 9, 1);

export const LEGAL_CONTENT: Record<LegalDocumentType, LegalSectionText[]> = {
  terms: [
    {
      title: 'Sobre o MindWay',
      paragraphs: [
        'O MindWay é uma plataforma para organizar informações relacionadas ao acompanhamento e desenvolvimento infantil, conectando responsáveis, profissionais de saúde e instituições de ensino.',
      ],
    },
    {
      title: 'Aceitação dos termos',
      paragraphs: [
        'Ao utilizar a plataforma, você declara que leu e compreendeu estes termos e as informações da Política de privacidade.',
      ],
    },
    {
      title: 'Uso da plataforma',
      paragraphs: [
        'Use o MindWay apenas para finalidades legítimas relacionadas ao acompanhamento da criança. Mantenha os dados fornecidos corretos e atualizados.',
      ],
    },
    {
      title: 'Contas e segurança',
      paragraphs: [
        'Você é responsável por proteger suas credenciais e pelas atividades realizadas em sua conta. Avise a equipe responsável caso suspeite de uso indevido.',
      ],
    },
    {
      title: 'Permissões de acesso',
      paragraphs: [
        'O acesso às informações da criança deve ser concedido somente a pessoas autorizadas pelo responsável, de acordo com as funcionalidades disponíveis na plataforma.',
      ],
    },
  ],
  privacy: [
    {
      title: 'Quais dados coletamos',
      paragraphs: [
        'Podem ser tratados dados da conta do responsável, dados cadastrais da criança, informações de anamnese, relatórios e dados de profissionais vinculados.',
      ],
    },
    {
      title: 'Como utilizamos os dados',
      paragraphs: [
        'Os dados apoiam a organização das informações e o acompanhamento da criança por responsáveis e pessoas autorizadas.',
      ],
    },
    {
      title: 'Compartilhamento de dados',
      paragraphs: [
        'As informações da criança devem ser compartilhadas apenas com pessoas autorizadas pelo responsável, conforme os acessos habilitados na plataforma.',
      ],
    },
    {
      title: 'Segurança da informação',
      paragraphs: [
        'São adotadas medidas técnicas e organizacionais para proteger os dados contra acesso não autorizado, perda ou alteração indevida.',
      ],
    },
    {
      title: 'Seus direitos',
      paragraphs: [
        'O titular ou responsável pode solicitar acesso, correção ou exclusão de dados pessoais, observadas as obrigações legais aplicáveis.',
      ],
    },
  ],
};
