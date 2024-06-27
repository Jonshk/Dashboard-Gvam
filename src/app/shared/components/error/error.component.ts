import { Component, inject } from '@angular/core';
import { ErrorService } from '../../../core/services/error/error.service';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [],
  templateUrl: './error.component.html',
  styleUrl: './error.component.css',
})
export class ErrorComponent {
  readonly errorService = inject(ErrorService);
}
