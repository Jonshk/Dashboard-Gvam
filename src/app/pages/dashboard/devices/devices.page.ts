import { Component, computed, effect, input, signal } from '@angular/core';
import { DeviceService } from '../../../core/services/device/device.service';
import { Response } from '../../../core/models/response/response.model';
import { RegisterDevice } from '../../../core/models/response/register-device.model';
import { PolicyService } from '../../../core/services/policy/policy.service';
import { Policy } from '../../../core/models/response/policy.model';
import { Device } from '../../../core/models/response/device.model';
import { DeviceFormComponent } from './components/device-form/device-form.component';
import {
  DeleteDevice,
  DeviceListItemComponent,
} from './components/device-list-item/device-list-item.component';
import { LoadingService } from '../../../core/services/loading/loading.service';
import { forkJoin } from 'rxjs';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { DeleteDialogComponent } from '../../../shared/components/delete-dialog/delete-dialog.component';
import { SuccessResponse } from '../../../core/models/response/success-response.model';
import { DeviceUser } from '../../../core/models/response/device-user.model';
import { UserService } from '../../../core/services/user/user.service';
import { GroupService } from '../../../core/services/group/group.service';
import { Group } from '../../../core/models/response/group.model';

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

  private devices = signal<Device[]>([]);
  enrolledDevices = computed(() => this.devices().filter((d) => d.enrolled));
  notEnrolledDevices = computed(() =>
    this.devices().filter((d) => !d.enrolled),
  );

  showRegisteredDevices: boolean = true;
  newDevices?: RegisterDevice;
  policies: Policy[] = [];
  deviceUsers: DeviceUser[] = [];
  groups: Group[] = [];

  private _showFormDialog = signal(false);
  showFormDialog = this._showFormDialog.asReadonly();

  private _showDeleteDialog = signal(false);
  showDeleteDialog = this._showDeleteDialog.asReadonly();

  constructor(
    private deviceService: DeviceService,
    private policyService: PolicyService,
    private userService: UserService,
    private groupService: GroupService,
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
    const $deviceUsers = this.userService.list(this.groupId());
    const $groups = this.groupService.list();

    forkJoin([$devices, $policies, $deviceUsers, $groups]).subscribe({
      next: ([
        { data: devices },
        { data: policies },
        { data: deviceUsers },
        { data: groups },
      ]) => {
        this.devices.set(devices);
        this.policies = policies;
        this.deviceUsers = deviceUsers;
        this.groups = groups;

        this.loadingService.dismissLoading();
      },
      error: (err: any) => {
        console.error('error:', err);
        this.loadingService.dismissLoading();
      },
    });
  }

  private listDevices() {
    this.deviceService.list(this.groupId()).subscribe({
      next: ({ data }: Response<Device[]>) => {
        this.devices.set(data);
        this.loadingService.dismissLoading();
      },
      error: (err: any) => {
        console.error('error:', err);
        this.loadingService.dismissLoading();
      },
    });
  }

  onDeviceCreated(created: boolean) {
    if (created) {
      this.listDevices();
    }
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
          this.listDevices();
        } else {
          this.loadingService.dismissLoading();
        }
        this.newDevices = data;
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
    const index = this.devices().findIndex(
      (d) => d.deviceId === device.deviceId,
    );

    if (index !== -1) {
      this.devices()[index].deviceName = device.deviceName;
      this.hideFormDialog();
      return;
    }

    this.hideFormDialog();
  }

  deleteDevice(deleteDevice: DeleteDevice) {
    this.deviceToDelete = deleteDevice.device;
    // True cuando se borra un dispositivo
    if (deleteDevice.confirm) {
      this._showDeleteDialog.set(true);
      return;
    }

    this.migrate();
  }

  private migrate() {
    this.devices.update((devices) =>
      devices.filter(
        (device) => device.deviceId !== this.deviceToDelete!.deviceId,
      ),
    );
    this.deviceToDelete = null;
  }

  onDeleteConfirm(shouldDelete: boolean) {
    if (!shouldDelete || !this.deviceToDelete) return;

    this.loadingService.setLoading();
    this.deviceService
      .delete(
        this.groupId(),
        this.deviceToDelete.deviceId,
        this.deviceToDelete.enrolled,
      )
      .subscribe({
        next: ({ data }: Response<SuccessResponse>) => {
          if (data.success) {
            this.devices.update((devices) =>
              devices.filter(
                (device) => device.deviceId !== this.deviceToDelete!.deviceId,
              ),
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
