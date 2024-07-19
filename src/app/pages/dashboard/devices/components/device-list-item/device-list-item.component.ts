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
import { DeviceCommand } from '../../../../../core/enums/device-command';
import { DeviceCommandRequest } from '../../../../../core/models/request/device-command-request.model';
import { RouterModule } from '@angular/router';
import { Group } from '../../../../../core/models/response/group.model';
import { MigrateDeviceRequest } from '../../../../../core/models/request/migrate-device-request';
import { DeviceUser } from '../../../../../core/models/response/device-user.model';

@Component({
  selector: '[app-device-list-item]',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './device-list-item.component.html',
  styleUrl: './device-list-item.component.css',
})
export class DeviceListItemComponent {
  readonly groupId = input.required<number>();
  readonly device = input.required<Device>();
  readonly policies = input.required<Policy[]>();
  readonly groups = input.required<Group[]>();
  readonly deviceUser = input<DeviceUser | undefined>(undefined);

  readonly onSelectDevice = output<SelectDevice>();
  readonly onEditDevice = output<Device>();
  readonly onDeleteDevice = output<DeleteDevice>();

  private deviceService = inject(DeviceService);
  readonly loadingService = inject(LoadingService);

  applyPolicyForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
  });

  readonly DeviceCommand = DeviceCommand;
  readonly deviceCommandKeys = Object.keys(DeviceCommand) as [
    keyof typeof DeviceCommand,
  ];
  sendCommandForm = new FormGroup({
    command: new FormControl(DeviceCommand.LOCK, [Validators.required]),
  });

  migrateForm = new FormGroup({
    groupId: new FormControl(-1, [Validators.required]),
  });

  private setDefaultPolicy = effect(() => {
    this.applyPolicyForm.controls.name.setValue(this.device().policyName);
  });

  private setCurrentGroup = effect(() => {
    this.migrateForm.controls.groupId.setValue(this.groupId());
  });

  editDevice() {
    this.onEditDevice.emit(this.device());
  }

  deleteDevice(confirm: boolean = true) {
    const deleteDevice: DeleteDevice = {
      device: this.device(),
      confirm: confirm,
    };

    this.onDeleteDevice.emit(deleteDevice);
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

  sendCommand() {
    if (this.sendCommandForm.invalid) return;

    this.loadingService.setLoading();

    const deviceCommandRequest: DeviceCommandRequest = {
      deviceCommand: this.sendCommandForm.value.command!,
    };

    this.deviceService
      .sendCommand(this.groupId(), this.device().deviceId, deviceCommandRequest)
      .subscribe({
        next: ({ data }: Response<SuccessResponse>) => {
          if (data.success) {
            console.log('Comando enviado');
          }
          this.loadingService.dismissLoading();
        },
        error: (err: any) => {
          console.error('error:', err);
          this.loadingService.dismissLoading();
        },
      });
  }

  migrate() {
    if (this.migrateForm.invalid) return;

    if (this.groupId() === this.migrateForm.value.groupId) return;

    this.loadingService.setLoading();

    const migrateDeviceRequest: MigrateDeviceRequest = {
      groupId: this.migrateForm.value.groupId!,
    };

    this.deviceService
      .migrate(this.groupId(), this.device().deviceId, migrateDeviceRequest)
      .subscribe({
        next: ({ data }: Response<SuccessResponse>) => {
          if (data.success) {
            console.log('Dispositivo migrado');
            this.deleteDevice(false);
          }
          this.loadingService.dismissLoading();
        },
        error: (err: any) => {
          console.error('error:', err);
          this.loadingService.dismissLoading();
        },
      });
  }

  toggleSelected(event: Event) {
    const checkbox = event.currentTarget as HTMLInputElement;

    const selectDevice: SelectDevice = {
      device: this.device(),
      select: checkbox.checked,
    };

    this.onSelectDevice.emit(selectDevice);
  }
}

export interface DeleteDevice {
  device: Device;
  confirm: boolean;
}

export interface SelectDevice {
  device: Device;
  select: boolean;
}
