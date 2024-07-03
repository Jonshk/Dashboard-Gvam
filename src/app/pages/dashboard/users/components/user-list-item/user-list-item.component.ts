import { Component, inject, input, output } from '@angular/core';
import { DeviceUser } from '../../../../../core/models/response/device-user.model';
import { LoadingService } from '../../../../../core/services/loading/loading.service';
import { UserService } from '../../../../../core/services/user/user.service';
import { Response } from '../../../../../core/models/response/response.model';
import { SuccessResponse } from '../../../../../core/models/response/success-response.model';

@Component({
  selector: 'app-user-list-item',
  standalone: true,
  imports: [],
  templateUrl: './user-list-item.component.html',
  styleUrl: './user-list-item.component.css',
})
export class UserListItemComponent {
  readonly groupId = input.required<number>();
  readonly user = input.required<DeviceUser>();

  readonly onEditUser = output<DeviceUser>();
  readonly onDeleteUser = output<number>();

  private userService = inject(UserService);
  readonly loadingService = inject(LoadingService);

  editUser() {
    this.onEditUser.emit(this.user());
  }

  deletePolicy() {
    this.loadingService.setLoading();
    this.userService
      .delete(this.groupId(), this.user().deviceUserId)
      .subscribe({
        next: ({ data }: Response<SuccessResponse>) => {
          if (data.success) {
            this.onDeleteUser.emit(this.user().deviceUserId);
            this.loadingService.dismissLoading();
          }
        },
        error: (err: any) => {
          console.error('error:', err);
          this.loadingService.dismissLoading();
        },
      });
  }
}
