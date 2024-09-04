import { Component, effect, inject, input, output } from '@angular/core';
import { DeviceUser } from '../../../../../core/models/response/device-user.model';
import { UserService } from '../../../../../core/services/user/user.service';
import { LoadingService } from '../../../../../core/services/loading/loading.service';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { CustomValidators } from '../../../../../shared/util/custom-validators';
import { CreateDeviceUserRequest } from '../../../../../core/models/request/create-device-user-request.model';
import { Response } from '../../../../../core/models/response/response.model';
import { PolicyService } from '../../../../../core/services/policy/policy.service';
import { Policy } from '../../../../../core/models/response/policy.model';
import { Group } from '../../../../../core/models/response/group.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
})
export class UserFormComponent {
  readonly groupId = input.required<number>();
  readonly groups = input.required<Group[]>();
  readonly isVisible = input.required<boolean>();
  readonly editUser = input<DeviceUser | null>(null);

  user = output<DeviceUser>();

  policies: Policy[] = [];
  groupPolicies: Policy[] = [];

  private userService = inject(UserService);
  private policyService = inject(PolicyService);
  readonly loadingService = inject(LoadingService);

  private defaultFormValues = {
    name: '',
    email: '',
    password: '',
    repeatPassword: '',
    policy: '',
    group: -1,
  };

  userForm = new FormGroup(
    {
      name: new FormControl(this.defaultFormValues.name, [Validators.required]),
      email: new FormControl(this.defaultFormValues.email, [
        Validators.required,
        Validators.email,
      ]),
      password: new FormControl(this.defaultFormValues.password, [
        Validators.required,
      ]),
      repeatPassword: new FormControl(this.defaultFormValues.repeatPassword, [
        Validators.required,
      ]),
      policy: new FormControl(this.defaultFormValues.policy, [
        Validators.required,
      ]),
      group: new FormControl(this.defaultFormValues.group),
    },
    { validators: [CustomValidators.repeatPasswordValidator()] },
  );

  private updateFormValidator = effect(() => {
    const validators = [Validators.required, this.policyValidator()];
    if (this.groupId() || this.editUser()) {
      this.userForm.controls.group.removeValidators(validators);
    } else {
      this.userForm.controls.group.addValidators(validators);
    }
  });

  private policyValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      console.log('validating...');
      const group = control.value;
      if (group && group != -1) {
        this.updatePolicies(group);
        this.userForm.controls.policy.setValue(
          this.groupPolicies[0]?.name ?? this.defaultFormValues.policy,
        );
      }
      return null;
    };
  }

  private initializePolicies = effect(() => {
    this.updatePolicies();
  });

  private updatePolicies(group?: number) {
    if (this.groupId()) return (this.groupPolicies = this.policies);

    if (this.editUser()) {
      return (this.groupPolicies = this.policies.filter(
        (u) => u.groupId === this.editUser()!.groupId,
      ));
    }

    if (group) {
      return (this.groupPolicies = this.policies.filter(
        (u) => u.groupId == group,
      ));
    }

    return (this.groupPolicies = []);
  }

  private getGroupPolicies = effect(() => {
    if (this.groupId()) {
      this.policyService.list(this.groupId()).subscribe({
        next: ({ data }: Response<Policy[]>) => {
          this.policies = data;
          this.groupPolicies = data;
        },
        error: (err: any) => {
          console.error('error:', err);
        },
      });
    } else {
      this.policyService.listAll().subscribe({
        next: ({ data }: Response<Policy[]>) => {
          this.policies = data;
        },
        error: (err: any) => {
          console.error('error:', err);
        },
      });
    }
  });

  private setUserForm = effect(() => {
    this.resetForm();
    if (this.editUser()) {
      this.userForm.controls.name.setValue(this.editUser()!.name);
      this.userForm.controls.email.setValue(this.editUser()!.email);
      this.userForm.controls.policy.setValue(this.editUser()!.policyName);

      this.userForm.controls.password.removeValidators(Validators.required);
      this.userForm.controls.repeatPassword.removeValidators(
        Validators.required,
      );

      this.userForm.controls.password.setValue('');
      this.userForm.controls.repeatPassword.setValue('');
    }
  });

  private resetForm() {
    this.userForm.reset(this.defaultFormValues);
    this.userForm.controls.password.setValidators(Validators.required);
    this.userForm.controls.repeatPassword.setValidators(Validators.required);
  }

  private resetOnHide = effect(() => {
    if (!this.isVisible()) {
      this.resetForm();
    }
  });

  onSubmit() {
    if (this.userForm.invalid) return;

    this.loadingService.showLoading();

    const deviceUser: CreateDeviceUserRequest = {
      name: this.userForm.value.name!,
      email: this.userForm.value.email!,
      password: this.userForm.value.password,
      policyName: this.userForm.value.policy!,
    };

    if (this.editUser()) {
      this.updateDeviceUser(deviceUser);
      return;
    }

    this.createDeviceUser(deviceUser);
  }

  private createDeviceUser(newDeviceUser: CreateDeviceUserRequest) {
    const groupId = this.groupId() ?? this.userForm.value.group;

    this.userService.create(groupId, newDeviceUser).subscribe({
      next: ({ data }: Response<DeviceUser>) => {
        this.user.emit(data);
        this.resetForm();
        this.loadingService.dismissLoading();
      },
      error: (err: any) => {
        console.error('error:', err);
        this.loadingService.dismissLoading();
      },
    });
  }

  private updateDeviceUser(editedDeviceUser: CreateDeviceUserRequest) {
    const groupId = this.groupId() ?? this.editUser()?.groupId;

    this.userService
      .patch(groupId, this.editUser()!.deviceUserId, editedDeviceUser)
      .subscribe({
        next: ({ data }: Response<DeviceUser>) => {
          this.user.emit(data);
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
