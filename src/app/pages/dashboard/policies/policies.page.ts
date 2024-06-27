import { Component, effect, inject, input } from '@angular/core';
import { Policy } from '../../../core/models/response/policy.model';
import { PolicyService } from '../../../core/services/policy/policy.service';
import { Response } from '../../../core/models/response/response.model';
import { PolicyFormComponent } from './components/policy-form/policy-form.component';
import { PolicyListItemComponent } from './components/policy-list-item/policy-list-item.component';
import { LoadingService } from '../../../core/services/loading/loading.service';

@Component({
  selector: 'app-policies',
  standalone: true,
  imports: [PolicyFormComponent, PolicyListItemComponent],
  templateUrl: './policies.page.html',
  styleUrl: './policies.page.css',
})
export class PoliciesPage {
  readonly groupId = input.required<number>();

  policies: Policy[] = [];

  policyToEdit: Policy | null = null;

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

  createMode() {
    this.policyToEdit = null;
  }

  editPolicy(editPolicy: Policy) {
    this.policyToEdit = editPolicy;
  }

  addPolicy(policy: Policy) {
    const index = this.policies.findIndex((p) => p.name === policy.name);

    if (index !== -1) {
      this.policies[index] = policy;
      return;
    }

    this.policies.push(policy);
  }

  deletePolicy(name: string) {
    this.policies = this.policies.filter((policy) => policy.name !== name);
    if (this.policyToEdit !== null && this.policyToEdit.name === name) {
      this.createMode();
    }
  }
}
