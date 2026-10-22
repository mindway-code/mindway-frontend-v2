import { Component } from '@angular/core';

@Component({
  selector: 'app-help',
  standalone: false,
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss'],
})
export class HelpComponent {
  searchTerm = '';

  readonly faqs = [
    { question: 'Como criar uma conta no MindWay?', answer: 'Selecione “Cadastrar” e escolha o perfil que representa você. Depois, preencha seus dados para concluir o cadastro.' },
    { question: 'Como cadastrar uma criança?', answer: 'Acesse seu perfil e abra a área de crianças para adicionar uma criança e preencher as informações iniciais.' },
    { question: 'Quem pode acessar as informações?', answer: 'As informações ficam disponíveis para usuários autorizados e vinculados à criança, conforme o perfil e as permissões de acesso.' },
    { question: 'Como compartilhar com a escola ou profissional?', answer: 'No perfil da criança, use a opção de compartilhar acesso e envie o convite à instituição ou ao profissional.' },
    { question: 'Posso editar as informações depois?', answer: 'Sim. Acesse o perfil da criança para consultar e atualizar as informações que você registrou.' },
    { question: 'Meus dados estão seguros?', answer: 'Os dados são protegidos e o acesso às informações da criança é limitado às pessoas autorizadas.' },
  ];

  get filteredFaqs() {
    const term = this.normalize(this.searchTerm.trim());
    if (!term) return this.faqs;
    return this.faqs.filter((faq) => this.normalize(`${faq.question} ${faq.answer}`).includes(term));
  }

  searchFaqs(): void {
    this.searchTerm = this.searchTerm.trim();
  }

  private normalize(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
  }
}
