import { Component, effect, input } from '@angular/core';
import { DeviceService } from '../../../core/services/device/device.service';
import { Response } from '../../../core/models/response/response.model';
import { RegisterDevice } from '../../../core/models/response/register-device.model';
import { PolicyService } from '../../../core/services/policy/policy.service';
import { Policy } from '../../../core/models/response/policy.model';
import { Device } from '../../../core/models/response/device.model';
import { DeviceFormComponent } from './components/device-form/device-form.component';
import { DeviceListItemComponent } from './components/device-list-item/device-list-item.component';
import { LoadingService } from '../../../core/services/loading/loading.service';
import { asapScheduler, forkJoin } from 'rxjs';

@Component({
  selector: 'app-devices',
  standalone: true,
  imports: [DeviceFormComponent, DeviceListItemComponent],
  templateUrl: './devices.page.html',
  styleUrl: './devices.page.css',
})
export class DevicesPage {
  groupId = input.required<number>();

  deviceToEdit: Device | null = null;

  devices: Device[] = [];
  registeredDevices?: RegisterDevice;
  policies: Policy[] = [];

  constructor(
    private deviceService: DeviceService,
    private policyService: PolicyService,
    readonly loadingService: LoadingService,
  ) {}

  private loadData = effect(
    () => {
      this.listDevicesAndPolicies();
    },
    { allowSignalWrites: true },
  );

  private listDevicesAndPolicies() {
    this.loadingService.setLoading();
    const $devices = this.deviceService.list(this.groupId());
    const $policies = this.policyService.list(this.groupId());

    forkJoin([$devices, $policies]).subscribe({
      next: ([{ data: devices }, { data: policies }]) => {
        this.devices = devices;
        this.policies = policies;

        this.loadingService.dismissLoading();
      },
      error: (err: any) => {
        console.error('error:', err);
        this.loadingService.dismissLoading();
      },
    });
  }

  createMode() {
    this.deviceToEdit = null;
  }

  registerDevices() {
    this.loadingService.setLoading();
    this.deviceService.register(this.groupId()).subscribe({
      next: ({ data }: Response<RegisterDevice>) => {
        if (data.registeredDevices > 0) {
          this.listDevicesAndPolicies();
        } else {
          this.loadingService.dismissLoading();
        }
        this.registeredDevices = data;
      },
      error: (err: any) => {
        console.error('error:', err);
        this.loadingService.dismissLoading();
      },
    });
  }

  editDevice(device: Device) {
    this.deviceToEdit = device;
  }

  updateDevice(device: Device) {
    const index = this.devices.findIndex((d) => d.deviceId === device.deviceId);

    if (index !== -1) {
      this.devices[index].deviceName = device.deviceName;
      return;
    }
  }

  deleteDevice(deviceId: number) {
    this.devices = this.devices.filter(
      (device) => device.deviceId !== deviceId,
    );
  }
}
