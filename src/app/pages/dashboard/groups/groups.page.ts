import { Component } from '@angular/core';
import { Group } from '../../../core/models/response/group.model';
import { GroupService } from '../../../core/services/group/group.service';
import { Response } from '../../../core/models/response/response.model';
import { RouterModule } from '@angular/router';
import { GroupFormComponent } from './components/group-form/group-form.component';
import { GroupListItemComponent } from './components/group-list-item/group-list-item.component';
import { LoadingService } from '../../../core/services/loading/loading.service';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [RouterModule, GroupFormComponent, GroupListItemComponent],
  templateUrl: './groups.page.html',
  styleUrl: './groups.page.css',
})
export class GroupsPage {
  groupToEdit: Group | null = null;
  groups: Group[] = [];

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

  createMode() {
    this.groupToEdit = null;
  }

  editGroup(group: Group) {
    this.groupToEdit = group;
  }

  addGroup(group: Group) {
    const index = this.groups.findIndex((g) => g.groupId === group.groupId);

    if (index !== -1) {
      this.groups[index].groupName = group.groupName;
      return;
    }

    this.groups.push(group);
  }

  deleteGroup(groupId: number) {
    this.groups = this.groups.filter((group) => group.groupId !== groupId);
  }
}
