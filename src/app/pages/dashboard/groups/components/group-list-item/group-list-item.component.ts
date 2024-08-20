import { Component, inject, input, output } from '@angular/core';
import { Group } from '../../../../../core/models/response/group.model';
import { RouterModule } from '@angular/router';
import { LoadingService } from '../../../../../core/services/loading/loading.service';

@Component({
  selector: 'app-group-list-item',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './group-list-item.component.html',
  styleUrl: './group-list-item.component.scss',
})
export class GroupListItemComponent {
  readonly group = input.required<Group>();

  readonly onEditGroup = output<Group>();
  readonly onDeleteGroup = output<Group>();

  readonly loadingService = inject(LoadingService);

  editGroup() {
    this.onEditGroup.emit(this.group());
  }

  deleteGroup() {
    this.onDeleteGroup.emit(this.group());
  }
}
