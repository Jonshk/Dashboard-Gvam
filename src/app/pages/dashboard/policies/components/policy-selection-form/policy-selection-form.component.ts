import { Component, effect, inject, input, output } from '@angular/core';
import { DeviceUser } from '../../../../../core/models/response/device-user.model';
import { UserService } from '../../../../../core/services/user/user.service';
import { LoadingService } from '../../../../../core/services/loading/loading.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CustomValidators } from '../../../../../shared/util/custom-validators';
import { CreateDeviceUserRequest } from '../../../../../core/models/request/create-device-user-request.model';
import { Response } from '../../../../../core/models/response/response.model';
import { PolicyService } from '../../../../../core/services/policy/policy.service';
import { Policy } from '../../../../../core/models/response/policy.model';

@Component({
  selector: 'app-policy-selection-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './policy-selection-form.component.html',
  styleUrl: './policy-selection-form.component.scss',
})
export class PolicySelectionFormComponent {
  readonly groupId = input.required<number>();
  readonly isVisible = input.required<boolean>();
  readonly groupPolicies = input.required<Policy[]>();
  readonly editUser = input<DeviceUser | null>(null);
  policies: Policy[] = [];
  users: DeviceUser[] = [];
  
  
  policy = output<Policy>();

  private userService = inject(UserService);
  private policyService = inject(PolicyService);
  readonly loadingService = inject(LoadingService);

  private defaultFormValues = {
    policy: '',
  };

  policyForm = new FormGroup(
    {
      policy: new FormControl(this.defaultFormValues.policy, [
        Validators.required,
      ]),
    },
  );

  private getPolicies = effect(async () => {
    //list all users
    await this.policyService.listAll().subscribe({
      next: ({ data }: Response<Policy[]>) => {
        this.policies = data;
        console.log(this.policies)
        console.log(this.groupPolicies())
        //Exclude those that are already in the group
        var newPolicies: Policy[] = [];  

        
        this.policies.forEach(policy => {
          if(!this.groupPolicies().some(e => policy.name === e.name)){
            newPolicies.push(policy)
          }
        });
        
        this.policies = newPolicies;
      },
      error: (err: any) => {
        console.error('error:', err);
      },
    });        
  });

  private setUserForm = effect(() => {
    this.resetForm();
  });

  private resetForm() {
    this.policyForm.reset(this.defaultFormValues);
  }

  private resetOnHide = effect(() => {
    if (!this.isVisible()) {
      this.resetForm();
    }
  });

  onSubmit() {
    if (this.policyForm.invalid) return;

    this.loadingService.showLoading();
    //We get the selected policy
    const policyToAdd = this.policies.find((el: Policy) => el.name === this.policyForm.value.policy);

    console.log(policyToAdd);

    if(policyToAdd !== undefined){
      this.policyService.linkToGroup(this.groupId(), policyToAdd).subscribe({
        next: ({ data }: Response<Policy>) => {
          this.policy.emit(data);
          this.resetForm();
          this.loadingService.dismissLoading();
        },
        error: (err: any) => {
          console.error('error:', err);
          this.loadingService.dismissLoading();
        },
      });    
    }
  }
}
