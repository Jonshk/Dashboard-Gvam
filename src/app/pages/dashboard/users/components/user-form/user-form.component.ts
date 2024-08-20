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
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
})
export class UserFormComponent {
  readonly groupId = input.required<number>();
  readonly isVisible = input.required<boolean>();
  readonly editUser = input<DeviceUser | null>(null);
  policies: Policy[] = [];

  user = output<DeviceUser>();

  private userService = inject(UserService);
  private policyService = inject(PolicyService);
  readonly loadingService = inject(LoadingService);

  private defaultFormValues = {
    name: '',
    email: '',
    password: '',
    repeatPassword: '',
    policy: '',
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
    },
    { validators: [CustomValidators.repeatPasswordValidator()] },
  );

  private getGroupPolicies = effect(() => {
    this.policyService.list(this.groupId()).subscribe({
      next: ({ data }: Response<Policy[]>) => {
        this.policies = data;
      },
      error: (err: any) => {
        console.error('error:', err);
      },
    });
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
    this.userService.create(this.groupId(), newDeviceUser).subscribe({
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
    this.userService
      .patch(this.groupId(), this.editUser()!.deviceUserId, editedDeviceUser)
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
