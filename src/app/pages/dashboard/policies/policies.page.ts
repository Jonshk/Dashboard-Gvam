import { Component, effect, input, signal } from '@angular/core';
import { Policy } from '../../../core/models/response/policy.model';
import { PolicyService } from '../../../core/services/policy/policy.service';
import { Response } from '../../../core/models/response/response.model';
import { PolicyFormComponent } from './components/policy-form/policy-form.component';
import { PolicyListItemComponent } from './components/policy-list-item/policy-list-item.component';
import { LoadingService } from '../../../core/services/loading/loading.service';
import { SuccessResponse } from '../../../core/models/response/success-response.model';
import { DeleteDialogComponent } from '../../../shared/component/delete-dialog/delete-dialog.component';
import { DialogComponent } from '../../../shared/component/dialog/dialog.component';

@Component({
  selector: 'app-policies',
  standalone: true,
  imports: [
    PolicyFormComponent,
    PolicyListItemComponent,
    DialogComponent,
    DeleteDialogComponent,
  ],
  templateUrl: './policies.page.html',
  styleUrl: './policies.page.scss',
})
export class PoliciesPage {
  readonly groupId = input.required<number>();

  policies: Policy[] = [];

  policyToEdit: Policy | null = null;
  policyToDelete: Policy | null = null;

  private _showFormDialog = signal(false);
  showFormDialog = this._showFormDialog.asReadonly();

  private _showDeleteDialog = signal(false);
  showDeleteDialog = this._showDeleteDialog.asReadonly();

  constructor(
    private policyService: PolicyService,
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
    this.policyService.list(this.groupId()).subscribe({
      next: ({ data }: Response<Policy[]>) => {
        this.policies = data;
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

  hideDeleteDialog() {
    this._showDeleteDialog.set(false);
  }

  createMode() {
    this._showFormDialog.set(true);
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
    this.policyService
      .delete(this.groupId(), this.policyToDelete.name)
      .subscribe({
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
