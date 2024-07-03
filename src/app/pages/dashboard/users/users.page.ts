import { Component, effect, input, signal } from '@angular/core';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { UserFormComponent } from './components/user-form/user-form.component';
import { UserListItemComponent } from './components/user-list-item/user-list-item.component';
import { DeviceUser } from '../../../core/models/response/device-user.model';
import { UserService } from '../../../core/services/user/user.service';
import { LoadingService } from '../../../core/services/loading/loading.service';
import { Response } from '../../../core/models/response/response.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [DialogComponent, UserFormComponent, UserListItemComponent],
  templateUrl: './users.page.html',
  styleUrl: './users.page.css',
})
export class UsersPage {
  readonly groupId = input.required<number>();

  users: DeviceUser[] = [];

  userToEdit: DeviceUser | null = null;

  private _showDialog = signal(false);
  showDialog = this._showDialog.asReadonly();

  constructor(
    private userService: UserService,
    private loadingService: LoadingService,
  ) {}

  private listUsers = effect(
    () => {
      this.list();
    },
    { allowSignalWrites: true },
  );

  private list() {
    this.loadingService.setLoading();
    this.userService.list(this.groupId()).subscribe({
      next: ({ data }: Response<DeviceUser[]>) => {
        this.users = data;
        this.loadingService.dismissLoading();
      },
      error: (err: any) => {
        console.error('error:', err);
        this.loadingService.dismissLoading();
      },
    });
  }

  hideDialog() {
    this._showDialog.set(false);
    this.userToEdit = null;
  }

  createMode() {
    this._showDialog.set(true);
  }

  editUser(editUser: DeviceUser) {
    this.userToEdit = editUser;
    this._showDialog.set(true);
  }

  addUser(user: DeviceUser) {
    const index = this.users.findIndex((u) => u.name === user.name);

    if (index !== -1) {
      this.users[index] = user;
      this.hideDialog();
      return;
    }

    this.users.push(user);
    this.hideDialog();
  }

  deleteUser(id: number) {
    this.users = this.users.filter((user) => user.deviceUserId !== id);
  }
}
