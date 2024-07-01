import { Component, effect, input, signal } from '@angular/core';
import { Policy } from '../../../core/models/response/policy.model';
import { PolicyService } from '../../../core/services/policy/policy.service';
import { Response } from '../../../core/models/response/response.model';
import { PolicyFormComponent } from './components/policy-form/policy-form.component';
import { PolicyListItemComponent } from './components/policy-list-item/policy-list-item.component';
import { LoadingService } from '../../../core/services/loading/loading.service';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';

@Component({
  selector: 'app-policies',
  standalone: true,
  imports: [PolicyFormComponent, PolicyListItemComponent, DialogComponent],
  templateUrl: './policies.page.html',
  styleUrl: './policies.page.css',
})
export class PoliciesPage {
  readonly groupId = input.required<number>();

  policies: Policy[] = [];

  policyToEdit: Policy | null = null;

  private _showDialog = signal(false);
  showDialog = this._showDialog.asReadonly();

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

  hideDialog() {
    this._showDialog.set(false);
    this.policyToEdit = null;
  }

  createMode() {
    this._showDialog.set(true);
  }

  editPolicy(editPolicy: Policy) {
    this.policyToEdit = editPolicy;
    this._showDialog.set(true);
  }

  addPolicy(policy: Policy) {
    const index = this.policies.findIndex((p) => p.name === policy.name);

    if (index !== -1) {
      this.policies[index] = policy;
      this.hideDialog();
      return;
    }

    this.policies.push(policy);
    this.hideDialog();
  }

  deletePolicy(name: string) {
    this.policies = this.policies.filter((policy) => policy.name !== name);
  }
}
