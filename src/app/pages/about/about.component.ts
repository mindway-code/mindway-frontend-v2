import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: false,
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent {
  readonly values = [
    { icon: 'bi-heart-fill', title: 'Nosso propósito', text: 'Facilitar o acesso à informação e fortalecer a rede de apoio para o desenvolvimento infantil.', tone: 'mint' },
    { icon: 'bi-people-fill', title: 'Quem somos', text: 'Um projeto pensado para famílias, escolas e profissionais que acreditam no potencial de cada criança.', tone: 'blue' },
    { icon: 'bi-shield-fill-check', title: 'Segurança e privacidade', text: 'Seus dados são protegidos e compartilhados apenas com pessoas autorizadas.', tone: 'gold' },
    { icon: 'bi-bar-chart-fill', title: 'Nossos valores', text: 'Respeito, inclusão, colaboração e compromisso com o desenvolvimento humano.', tone: 'purple' },
  ];
}
