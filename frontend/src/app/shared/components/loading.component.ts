import { Component, Input } from '@angular/core';
import { LABELS } from '../../core/constants';

@Component({
  selector: 'app-loading',
  standalone: true,
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss',
})
export class LoadingComponent {
  @Input() message: string = LABELS.loading;
}
