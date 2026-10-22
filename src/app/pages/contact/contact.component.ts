import { Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  standalone: false,
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent {
  name = '';
  email = '';
  subject = '';
  message = '';
  submitted = false;

  readonly subjects = ['Cadastro e acesso', 'Perfil da criança', 'Anamnese e registros', 'Relatórios', 'Privacidade e segurança', 'Sugestão', 'Outro'];

  sendMessage(): void {
    this.submitted = true;
    if (!this.name.trim() || !this.email.trim() || !this.subject || !this.message.trim()) return;

    const body = `Nome: ${this.name.trim()}\nE-mail: ${this.email.trim()}\n\n${this.message.trim()}`;
    const mailto = `mailto:contato@mindway.com.br?subject=${encodeURIComponent(`[MindWay] ${this.subject}`)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  }
}
