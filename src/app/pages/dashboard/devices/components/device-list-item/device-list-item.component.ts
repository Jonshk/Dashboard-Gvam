import { Component, effect, inject, input, output } from '@angular/core';
import { Device } from '../../../../../core/models/response/device.model';
import { Policy } from '../../../../../core/models/response/policy.model';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { DeviceService } from '../../../../../core/services/device/device.service';
import { SuccessResponse } from '../../../../../core/models/response/success-response.model';
import { Response } from '../../../../../core/models/response/response.model';
import { ApplyDevicePolicyRequest } from '../../../../../core/models/request/apply-device-policy-request.model';
import { LoadingService } from '../../../../../core/services/loading/loading.service';

@Component({
  selector: 'app-device-list-item',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './device-list-item.component.html',
  styleUrl: './device-list-item.component.css',
})
export class DeviceListItemComponent {
  readonly groupId = input.required<number>();
  readonly device = input.required<Device>();
  readonly policies = input.required<Policy[]>();

  readonly onEditDevice = output<Device>();
  readonly onDeleteDevice = output<number>();

  private deviceService = inject(DeviceService);
  readonly loadingService = inject(LoadingService);

  applyPolicyForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
  });

  private setDefaultPolicy = effect(() => {
    this.applyPolicyForm.controls.name.setValue(this.device().policyName);
  });

  editDevice() {
    this.onEditDevice.emit(this.device());
  }

  deleteDevice() {
    this.loadingService.setLoading();
    this.deviceService
      .delete(this.groupId(), this.device().deviceId)
      .subscribe({
        next: ({ data }: Response<SuccessResponse>) => {
          if (data.success) {
            this.onDeleteDevice.emit(this.device().deviceId);
          }
          this.loadingService.dismissLoading();
        },
        error: (err: any) => {
          console.error('error:', err);
          this.loadingService.dismissLoading();
        },
      });
  }

  applyPolicy() {
    if (this.applyPolicyForm.invalid) return;

    this.loadingService.setLoading();

    const devicePolicyRequest: ApplyDevicePolicyRequest = {
      policyName: this.applyPolicyForm.value.name!,
    };

    this.deviceService
      .applyPolicy(this.groupId(), this.device().deviceId, devicePolicyRequest)
      .subscribe({
        next: ({ data }: Response<SuccessResponse>) => {
          if (data.success) {
            console.log('Política actualizada');
            this.device().policyName = devicePolicyRequest.policyName;
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
