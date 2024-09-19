import { Component, effect, input, signal } from '@angular/core';
import { Policy } from '../../../core/models/response/policy.model';
import { PolicyService } from '../../../core/services/policy/policy.service';
import { Response } from '../../../core/models/response/response.model';
import { PolicyFormComponent } from './components/policy-form/policy-form.component';
import { PolicyListItemComponent } from './components/policy-list-item/policy-list-item.component';
import { PolicySelectionFormComponent } from './components/policy-selection-form/policy-selection-form.component';
import { LoadingService } from '../../../core/services/loading/loading.service';
import { SuccessResponse } from '../../../core/models/response/success-response.model';
import { DeleteDialogComponent } from '../../../shared/component/delete-dialog/delete-dialog.component';
import { DialogComponent } from '../../../shared/component/dialog/dialog.component';
import { Group } from '../../../core/models/response/group.model';
import { GroupService } from '../../../core/services/group/group.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-policies',
  standalone: true,
  imports: [
    PolicyFormComponent,
    PolicyListItemComponent,
    PolicySelectionFormComponent,
    DialogComponent,
    DeleteDialogComponent,
  ],
  templateUrl: './policies.page.html',
  styleUrl: './policies.page.scss',
})
export class PoliciesPage {
  readonly groupId = input.required<number>();

  policies: Policy[] = [];
  groups: Group[] = [];

  policyToEdit: Policy | null = null;
  policyToDelete: Policy | null = null;

  private _showFormDialog = signal(false);
  showFormDialog = this._showFormDialog.asReadonly();

  private _showSelectionDialog = signal(false);
  showSelectionDialog = this._showSelectionDialog.asReadonly();

  private _showDeleteDialog = signal(false);
  showDeleteDialog = this._showDeleteDialog.asReadonly();

  constructor(
    private policyService: PolicyService,
    private groupService: GroupService,
    private loadingService: LoadingService,
  ) {}

  private listPolicies = effect(
    () => {
      this.list();
    },
    { allowSignalWrites: true },
  );

  private list() {
    this.loadingService.setLoading();

    const $groups = this.groupService.list();
    const $policies = this.groupId()
      ? this.policyService.list(this.groupId())
      : this.policyService.listAll();

    forkJoin([$groups, $policies]).subscribe({
      next: ([{ data: groups }, { data: policies }]) => {
        this.groups = groups;
        this.policies = policies;
        this.loadingService.dismissLoading();
      },
      error: (err: any) => {
        console.error('error:', err);
        this.loadingService.dismissLoading();
      },
    });
  }

  hideFormDialog() {
    this._showFormDialog.set(false);
    this.policyToEdit = null;
  }

  hideSelectionDialog() {
    this._showSelectionDialog.set(false);
    this.policyToEdit = null;
  }

  hideDeleteDialog() {
    this._showDeleteDialog.set(false);
  }
  

  createMode() {
    this._showFormDialog.set(true);
  }

  addMode() {
    this._showSelectionDialog.set(true);
  }

  editPolicy(editPolicy: Policy) {
    this.policyToEdit = editPolicy;
    this._showFormDialog.set(true);
  }

  addPolicy(policy: Policy) {
    if (policy.isDefault) {
      this.policies.forEach((p) => (p.isDefault = false));
    }

    const index = this.policies.findIndex((p) => p.name === policy.name);

    if (index !== -1) {
      this.policies[index] = policy;
      this.hideFormDialog();
      return;
    }

    this.policies.push(policy);
    this.hideFormDialog();
  }

  deletePolicy(policy: Policy) {
    this.policyToDelete = policy;
    this._showDeleteDialog.set(true);
  }

  onDeleteConfirm(shouldDelete: boolean) {
    if (!shouldDelete || !this.policyToDelete) return;

    this.loadingService.setLoading();
    const groupId = this.groupId() ?? this.policyToDelete.groupId;
    this.policyService.delete(groupId, this.policyToDelete.name).subscribe({
      next: ({ data }: Response<SuccessResponse>) => {
        if (data) {
          this.policies = this.policies.filter(
            (policy) => policy.name !== this.policyToDelete!.name,
          );
          this.policyToDelete = null;
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
