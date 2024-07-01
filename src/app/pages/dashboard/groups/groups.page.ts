import { Component, signal } from '@angular/core';
import { Group } from '../../../core/models/response/group.model';
import { GroupService } from '../../../core/services/group/group.service';
import { Response } from '../../../core/models/response/response.model';
import { RouterModule } from '@angular/router';
import { GroupFormComponent } from './components/group-form/group-form.component';
import { GroupListItemComponent } from './components/group-list-item/group-list-item.component';
import { LoadingService } from '../../../core/services/loading/loading.service';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [
    RouterModule,
    GroupFormComponent,
    GroupListItemComponent,
    DialogComponent,
  ],
  templateUrl: './groups.page.html',
  styleUrl: './groups.page.css',
})
export class GroupsPage {
  groupToEdit: Group | null = null;
  groups: Group[] = [];

  private _showDialog = signal(false);
  showDialog = this._showDialog.asReadonly();

  constructor(
    private groupService: GroupService,
    private loadingService: LoadingService,
  ) {
    this.list();
  }

  private list() {
    this.loadingService.setLoading();
    this.groupService.list().subscribe({
      next: ({ data }: Response<Group[]>) => {
        this.groups = data;
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
    this.groupToEdit = null;
  }

  createMode() {
    this._showDialog.set(true);
  }

  editGroup(group: Group) {
    this.groupToEdit = group;
    this._showDialog.set(true);
  }

  addGroup(group: Group) {
    const index = this.groups.findIndex((g) => g.groupId === group.groupId);

    if (index !== -1) {
      this.groups[index].groupName = group.groupName;
      this.hideDialog();
      return;
    }

    this.groups.push(group);
    this.hideDialog();
  }

  deleteGroup(groupId: number) {
    this.groups = this.groups.filter((group) => group.groupId !== groupId);
  }
}
