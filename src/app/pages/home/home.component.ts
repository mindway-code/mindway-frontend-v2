import { Component } from '@angular/core';

interface HomeCard {
  title: string;
  description: string;
  img: string;
  alt: string;
  buttonText: string;
  route: string;
}

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent {
  placeholderImg = 'assets/img/placeholder.PNG';
  cards: HomeCard[] = [
    {
      title: 'Meu perfil',
      description: 'Acesse e gerencie suas informações pessoais de forma rápida e organizada.',
      img: 'assets/webp/family.webp',
      alt: 'Ilustração da área de perfil',
      buttonText: 'Acessar perfil',
      route: '/profile'
    },
    {
      title: 'Relatórios',
      description: 'Visualize dados, acompanhamentos e informações importantes em um só lugar.',
      img: 'assets/webp/relate.webp',
      alt: 'Ilustração da área de relatórios',
      buttonText: 'Ver relatórios',
      route: '/reports'
    },
    {
      title: 'Acessar painel',
      description: 'Consulte e preencha informações com praticidade e clareza.',
      img: 'assets/webp/relate2.webp',
      alt: 'Ilustração da ficha de anamnese',
      buttonText: 'Ir para o painel',
      route: '/dashboard'
    }
  ];
}
