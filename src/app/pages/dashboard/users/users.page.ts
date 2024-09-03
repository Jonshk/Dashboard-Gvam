import { Component, effect, input, signal } from '@angular/core';
import { UserFormComponent } from './components/user-form/user-form.component';
import { UserSelectionFormComponent } from './components/user-selection-form/user-selection-form.component';
import { UserListItemComponent } from './components/user-list-item/user-list-item.component';
import { DeviceUser } from '../../../core/models/response/device-user.model';
import { UserService } from '../../../core/services/user/user.service';
import { LoadingService } from '../../../core/services/loading/loading.service';
import { Response } from '../../../core/models/response/response.model';
import { SuccessResponse } from '../../../core/models/response/success-response.model';
import { DeleteDialogComponent } from '../../../shared/component/delete-dialog/delete-dialog.component';
import { DialogComponent } from '../../../shared/component/dialog/dialog.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    DialogComponent,
    UserFormComponent,
    UserSelectionFormComponent,
    UserListItemComponent,
    DeleteDialogComponent,
  ],
  templateUrl: './users.page.html',
  styleUrl: './users.page.scss',
})
export class UsersPage {
  readonly groupId = input.required<number>();

  users: DeviceUser[] = [];
  isAll: boolean = true;

  userToEdit: DeviceUser | null = null;
  userToDelete: DeviceUser | null = null;

  private _showDialog = signal(false);
  showDialog = this._showDialog.asReadonly();

  private _showSelectionDialog = signal(false);
  showSelectionDialog = this._showSelectionDialog.asReadonly();

  private _showDeleteDialog = signal(false);
  showDeleteDialog = this._showDeleteDialog.asReadonly();

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
    if(this.groupId()){
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
    }else{
      this.loadingService.setLoading();
      this.userService.listAll().subscribe({
        next: ({ data }: Response<DeviceUser[]>) => {
          this.users = data;
          console.log(this.users)
          this.loadingService.dismissLoading();
        },
        error: (err: any) => {
          console.error('error:', err);
          this.loadingService.dismissLoading();
        },
      });
    }
  }

  hideDialog() {
    this._showDialog.set(false);
    this.userToEdit = null;
  }

  hideSelectionDialog() {
    this._showSelectionDialog.set(false);
    this.userToEdit = null;
  }

  hideDeleteDialog() {
    this._showDeleteDialog.set(false);
    this.userToDelete = null;
  }

  createMode() {
    this._showDialog.set(true);
  }

  addMode() {
    this._showSelectionDialog.set(true);
  }

  editUser(editUser: DeviceUser) {
    this.userToEdit = editUser;
    this._showDialog.set(true);
  }

  addUser(user: DeviceUser) {
    const index = this.users.findIndex(
      (u) => u.deviceUserId === user.deviceUserId,
    );

    if (index !== -1) {
      this.users[index] = user;
      this.hideDialog();
      return;
    }

    this.users.push(user);
    this.hideDialog();
  }

  deleteUser(user: DeviceUser) {
    this.userToDelete = user;
    this._showDeleteDialog.set(true);
  }

  onDeleteConfirm(shouldDelete: boolean) {
    if (!shouldDelete || !this.userToDelete) return;

    this.loadingService.setLoading();
    this.userService
      .delete(this.groupId(), this.userToDelete!.deviceUserId)
      .subscribe({
        next: ({ data }: Response<SuccessResponse>) => {
          if (data.success) {
            this.users = this.users.filter(
              (u) => u.deviceUserId !== this.userToDelete!.deviceUserId,
            );
            this.hideDeleteDialog();
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
