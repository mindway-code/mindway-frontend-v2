import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type PageSkeletonVariant = 'page' | 'list' | 'detail' | 'table';

@Component({
  selector: 'app-page-skeleton',
  standalone: false,
  templateUrl: './page-skeleton.component.html',
  styleUrl: './page-skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageSkeletonComponent {
  @Input() variant: PageSkeletonVariant = 'page';
  @Input() label = 'Carregando conteúdo';
  @Input() rows = 4;
  @Input() compact = false;

  readonly rowPlaceholders = [0, 1, 2, 3, 4, 5, 6, 7];
}
