import { Component, effect, input, signal } from '@angular/core';
import { DeviceService } from '../../../core/services/device/device.service';
import { Response } from '../../../core/models/response/response.model';
import { RegisterDevice } from '../../../core/models/response/register-device.model';
import { PolicyService } from '../../../core/services/policy/policy.service';
import { Policy } from '../../../core/models/response/policy.model';
import { Device } from '../../../core/models/response/device.model';
import { DeviceFormComponent } from './components/device-form/device-form.component';
import { DeviceListItemComponent } from './components/device-list-item/device-list-item.component';
import { LoadingService } from '../../../core/services/loading/loading.service';
import { forkJoin } from 'rxjs';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { DeleteDialogComponent } from '../../../shared/components/delete-dialog/delete-dialog.component';
import { SuccessResponse } from '../../../core/models/response/success-response.model';

@Component({
  selector: 'app-devices',
  standalone: true,
  imports: [
    DeviceFormComponent,
    DeviceListItemComponent,
    DialogComponent,
    DeleteDialogComponent,
  ],
  templateUrl: './devices.page.html',
  styleUrl: './devices.page.css',
})
export class DevicesPage {
  groupId = input.required<number>();

  deviceToEdit: Device | null = null;
  deviceToDelete: Device | null = null;

  devices: Device[] = [];
  registeredDevices?: RegisterDevice;
  policies: Policy[] = [];

  private _showFormDialog = signal(false);
  showFormDialog = this._showFormDialog.asReadonly();

  private _showDeleteDialog = signal(false);
  showDeleteDialog = this._showDeleteDialog.asReadonly();

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

  hideFormDialog() {
    this._showFormDialog.set(false);
    this.deviceToEdit = null;
  }

  hideDeleteDialog() {
    this._showDeleteDialog.set(false);
  }

  createMode() {
    this._showFormDialog.set(true);
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
    this._showFormDialog.set(true);
  }

  updateDevice(device: Device) {
    const index = this.devices.findIndex((d) => d.deviceId === device.deviceId);

    if (index !== -1) {
      this.devices[index].deviceName = device.deviceName;
      this.hideFormDialog();
      return;
    }

    this.hideFormDialog();
  }

  deleteDevice(device: Device) {
    this.deviceToDelete = device;
    this._showDeleteDialog.set(true);
  }

  onDeleteConfirm(shouldDelete: boolean) {
    if (!shouldDelete || !this.deviceToDelete) return;

    this.loadingService.setLoading();
    this.deviceService
      .delete(this.groupId(), this.deviceToDelete.deviceId)
      .subscribe({
        next: ({ data }: Response<SuccessResponse>) => {
          if (data.success) {
            this.devices = this.devices.filter(
              (device) => device.deviceId !== this.deviceToDelete!.deviceId,
            );
            this.deviceToDelete = null;
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
