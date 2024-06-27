import { Component, inject, input, output } from '@angular/core';
import { Group } from '../../../../../core/models/response/group.model';
import { RouterModule } from '@angular/router';
import { GroupService } from '../../../../../core/services/group/group.service';
import { SuccessResponse } from '../../../../../core/models/response/success-response.model';
import { Response } from '../../../../../core/models/response/response.model';
import { LoadingService } from '../../../../../core/services/loading/loading.service';

@Component({
  selector: 'app-group-list-item',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './group-list-item.component.html',
  styleUrl: './group-list-item.component.css',
})
export class GroupListItemComponent {
  readonly group = input.required<Group>();

  readonly onEditGroup = output<Group>();
  readonly onDeleteGroup = output<number>();

  private groupService = inject(GroupService);
  readonly loadingService = inject(LoadingService);

  editGroup() {
    this.onEditGroup.emit(this.group());
  }

  deleteGroup() {
    this.loadingService.setLoading();
    this.groupService.delete(this.group().groupId).subscribe({
      next: ({ data }: Response<SuccessResponse>) => {
        if (data.success) {
          this.onDeleteGroup.emit(this.group().groupId);
        }
        this.loadingService.dismissLoading();
      },
      error: (err: any) => {
        console.error('error:', err);
        this.loadingService.dismissLoading();
      },
    });
  }
}
