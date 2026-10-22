import { Component } from '@angular/core';

@Component({
  selector: 'app-how-it-works',
  standalone: false,
  templateUrl: './how-it-works.component.html',
  styleUrls: ['./how-it-works.component.scss'],
})
export class HowItWorksComponent {
  readonly steps = [
    { image: 'assets/img/illustrations/ilustracao-perfil-crianca.png', title: 'Crie sua conta', description: 'Escolha seu perfil e faça o cadastro de forma rápida e segura.', route: '/register-options' },
    { image: 'assets/img/illustrations/icone-perfil-relatorio-1.png', title: 'Cadastre a criança', description: 'Preencha o perfil com informações importantes sobre o desenvolvimento.', route: '/profile' },
    { image: 'assets/img/illustrations/icone-perfil-relatorio-2.png', title: 'Acompanhe', description: 'Visualize relatórios, observações e a evolução em um só lugar.', route: '/reports-child' },
    { image: 'assets/img/illustrations/ilustracao-equipe-profissionais.png', title: 'Compartilhe com a rede', description: 'Conecte-se com a escola e profissionais autorizados.', route: '/profile' },
  ];
}
