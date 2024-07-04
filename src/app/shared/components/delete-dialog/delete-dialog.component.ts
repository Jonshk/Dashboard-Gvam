import { Component, input, model, output } from '@angular/core';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'app-delete-dialog',
  standalone: true,
  imports: [DialogComponent],
  templateUrl: './delete-dialog.component.html',
  styleUrl: './delete-dialog.component.css',
})
export class DeleteDialogComponent {
  readonly open = model.required<boolean>();
  message = input.required<string>();

  readonly onDelete = output<boolean>();

  onDeleteClick() {
    this.onDelete.emit(true);
  }

  onDismiss() {
    this.open.set(false);
    this.onDelete.emit(false);
  }
}
