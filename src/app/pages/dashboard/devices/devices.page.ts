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
  SelectableDevice,
} from './components/device-list-item/device-list-item.component';
import { LoadingService } from '../../../core/services/loading/loading.service';
import { forkJoin, Observable } from 'rxjs';
import { SuccessResponse } from '../../../core/models/response/success-response.model';
import { DeviceUser } from '../../../core/models/response/device-user.model';
import { UserService } from '../../../core/services/user/user.service';
import { GroupService } from '../../../core/services/group/group.service';
import { Group } from '../../../core/models/response/group.model';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { DeviceCommand } from '../../../core/enums/device-command';
import { ApplyDevicePolicyRequest } from '../../../core/models/request/apply-device-policy-request.model';
import { DeviceCommandRequest } from '../../../core/models/request/device-command-request.model';
import { MigrateDeviceRequest } from '../../../core/models/request/migrate-device-request';
import { NgTemplateOutlet } from '@angular/common';
import { DeviceCustomCommandFormComponent } from './components/device-custom-command-form/device-custom-command-form.component';
import { DeviceCustomCommand } from '../../../core/enums/device-custom-command';
import { Geofence } from '../../../core/models/response/geofence.model';
import { GeofenceService } from '../../../core/services/geofence/geofence.service';
import { DeviceCustomCommandRequest } from '../../../core/models/request/device-custom-command-request.model';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { DeleteDialogComponent } from '../../../shared/component/delete-dialog/delete-dialog.component';
import { DialogComponent } from '../../../shared/component/dialog/dialog.component';

@Component({
  selector: 'app-devices',
  standalone: true,
  imports: [
    DeviceFormComponent,
    DeviceListItemComponent,
    DialogComponent,
    DeleteDialogComponent,
    ReactiveFormsModule,
    NgTemplateOutlet,
    DeviceCustomCommandFormComponent,
    NgbDropdownModule,
  ],
  templateUrl: './devices.page.html',
  styleUrl: './devices.page.scss',
})
export class DevicesPage {
  groupId = input.required<number>();

  deviceToEdit: Device | null = null;
  deviceToConfig: Device | null = null;
  deviceToDelete: Device | null = null;

  private devices = signal<SelectableDevice[]>([]);
  enrolledDevices = computed(() => this.devices().filter((d) => d.enrolled));
  notEnrolledDevices = computed(() =>
    this.devices().filter((d) => !d.enrolled),
  );

  selectedDevices = computed(() => this.devices().filter((d) => d.selected));

  showRegisteredDevices: boolean = true;
  newDevices?: RegisterDevice;
  policies: Policy[] = [];
  deviceUsers: DeviceUser[] = [];
  groups: Group[] = [];
  geofences: Geofence[] = [];
  actionDialog: ActionTypeDialog = 'hidden';

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

  readonly DeviceCustomCommand = DeviceCustomCommand;
  readonly deviceCustomCommandKeys = Object.keys(DeviceCustomCommand) as [
    keyof typeof DeviceCustomCommand,
  ];

  customCommandForm = new FormGroup({
    command: new FormControl(
      DeviceCustomCommand.ADJUST_BRIGHTNESS,
      Validators.required,
    ),
    value: new FormControl(0, [Validators.min(0), Validators.required]),
  });

  private _showFormDialog = signal(false);
  showFormDialog = this._showFormDialog.asReadonly();

  private _showConfigDialog = signal(false);
  showConfigDialog = this._showConfigDialog.asReadonly();

  private _showDeleteDialog = signal(false);
  showDeleteDialog = this._showDeleteDialog.asReadonly();

  constructor(
    private deviceService: DeviceService,
    private policyService: PolicyService,
    private userService: UserService,
    private groupService: GroupService,
    private geofenceService: GeofenceService,
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
    const $geofences = this.geofenceService.list(this.groupId());

    forkJoin([
      $devices,
      $policies,
      $deviceUsers,
      $groups,
      $geofences,
    ]).subscribe({
      next: ([
        { data: devices },
        { data: policies },
        { data: deviceUsers },
        { data: groups },
        { data: geofences },
      ]) => {
        this.devices.set(devices);
        this.policies = policies;
        this.deviceUsers = deviceUsers;
        this.groups = groups;
        this.geofences = geofences;

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

  getDeviceUser(deviceUserId?: number): DeviceUser | undefined {
    return this.deviceUsers.find((d) => d.deviceUserId === deviceUserId);
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

  hideConfigDialog() {
    this._showConfigDialog.set(false);
    this.deviceToConfig = null;
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

  selectDevice(selectableDevice: SelectableDevice) {
    this.devices.update((devices) => {
      const index = devices.findIndex(
        (d) => d.deviceId === selectableDevice.deviceId,
      );

      if (index !== -1) {
        devices[index].selected = selectableDevice.selected;
      }

      return [...devices];
    });
  }

  toggleRegisteredDevices(show: boolean) {
    if (show !== this.showRegisteredDevices) {
      this.unselectAll();
    }
    this.showRegisteredDevices = show;
  }

  selectAll() {
    this.devices.update((devices) => {
      if (this.showRegisteredDevices) {
        return devices.map((device) => {
          if (device.enrolled) {
            return { ...device, selected: true };
          }
          return device;
        });
      } else {
        return devices.map((device) => {
          if (!device.enrolled) {
            return { ...device, selected: true };
          }
          return device;
        });
      }
    });
  }

  unselectAll() {
    this.devices.update((devices) =>
      devices.map((device) => {
        return { ...device, selected: false };
      }),
    );
  }

  editDevice(device: Device) {
    this.deviceToEdit = device;
    this._showFormDialog.set(true);
  }

  configDevice(device: Device) {
    this.deviceToConfig = device;
    this._showConfigDialog.set(true);
  }

  updateDevice(device: Device) {
    const index = this.devices().findIndex(
      (d) => d.deviceId === device.deviceId,
    );

    if (index !== -1) {
      this.devices()[index].deviceName = device.deviceName;
      this.devices()[index].deviceUserId = device.deviceUserId;
      this.devices()[index].geofenceId = device.geofenceId;
      this.devices()[index].remoteControlActive = device.remoteControlActive;
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

  showActionDialog(): boolean {
    return this.actionDialog !== 'hidden';
  }

  hideActionDialog() {
    this.actionDialog = 'hidden';
  }

  changeActionDialog(action: ActionTypeDialog) {
    this.actionDialog = action;
  }

  applyPolicyAction() {
    if (this.applyPolicyForm.invalid) return;

    if (this.selectedDevices().length === 0) {
      this.hideActionDialog();
      return;
    }

    this.loadingService.setLoading();

    const applyDevicePolicyRequest: ApplyDevicePolicyRequest = {
      policyName: this.applyPolicyForm.value.name!,
    };

    const $policyRequests = this.selectedDevices().map((d) =>
      this.deviceService.applyPolicy(
        this.groupId(),
        d.deviceId,
        applyDevicePolicyRequest,
      ),
    );

    forkJoin($policyRequests).subscribe({
      next: (_: Response<SuccessResponse>[]) => {
        this.devices.update((devices) =>
          devices.map((d) => {
            if (this.selectedDevices().includes(d)) {
              return { ...d, policyName: applyDevicePolicyRequest.policyName };
            }

            return d;
          }),
        );
        this.hideActionDialog();
        this.loadingService.dismissLoading();
      },
      error: (err: any) => {
        console.error('error:', err);
        this.loadingService.dismissLoading();
      },
    });
  }

  sendCommandAction() {
    if (this.sendCommandForm.invalid) return;

    if (this.selectedDevices().length === 0) {
      this.hideActionDialog();
      return;
    }

    this.loadingService.setLoading();

    const deviceCommandRequest: DeviceCommandRequest = {
      deviceCommand: this.sendCommandForm.value.command!,
    };

    const $commandRequests = this.selectedDevices().map((d) =>
      this.deviceService.sendCommand(
        this.groupId(),
        d.deviceId,
        deviceCommandRequest,
      ),
    );

    forkJoin($commandRequests).subscribe({
      next: (_: Response<SuccessResponse>[]) => {
        this.hideActionDialog();
        this.loadingService.dismissLoading();
      },
      error: (err: any) => {
        console.error('error:', err);
        this.loadingService.dismissLoading();
      },
    });
  }

  migrateAction() {
    if (this.migrateForm.invalid) return;

    if (this.selectedDevices().length === 0) {
      this.hideActionDialog();
      return;
    }

    this.loadingService.setLoading();

    const migrateDeviceRequest: MigrateDeviceRequest = {
      groupId: this.migrateForm.value.groupId!,
    };

    const $migrateRequests = this.selectedDevices().map((d) =>
      this.deviceService.migrate(
        this.groupId(),
        d.deviceId,
        migrateDeviceRequest,
      ),
    );

    forkJoin($migrateRequests).subscribe({
      next: (_: Response<SuccessResponse>[]) => {
        this.devices.update((devices) =>
          devices.filter((d) => !this.selectedDevices().includes(d)),
        );
        this.hideActionDialog();
        this.loadingService.dismissLoading();
      },
      error: (err: any) => {
        console.error('error:', err);
        this.loadingService.dismissLoading();
      },
    });
  }

  deleteAction() {
    if (this.selectedDevices().length === 0) {
      this.hideActionDialog();
      return;
    }

    this.loadingService.setLoading();

    const $deleteRequests = this.selectedDevices().map((d) =>
      this.deviceService.delete(this.groupId(), d.deviceId, d.enrolled),
    );

    forkJoin($deleteRequests).subscribe({
      next: (_: Response<SuccessResponse>[]) => {
        this.devices.update((devices) =>
          devices.filter((d) => !this.selectedDevices().includes(d)),
        );
        this.hideActionDialog();
        this.loadingService.dismissLoading();
      },
      error: (err: any) => {
        console.error('error:', err);
        this.loadingService.dismissLoading();
      },
    });
  }

  customCommandAction() {
    if (this.sendCommandForm.invalid) return;

    if (this.selectedDevices().length === 0) {
      this.hideActionDialog();
      return;
    }

    this.loadingService.setLoading();

    let deviceCustomCommandRequest: DeviceCustomCommandRequest = {
      deviceCustomCommand: this.customCommandForm.value.command!,
      value: this.customCommandForm.value.value!,
    };

    const $customCommandRequests = this.selectedDevices()
      .map((d) => {
        if (
          deviceCustomCommandRequest.deviceCustomCommand !==
          DeviceCustomCommand.DEACTIVATE_GEOFENCE
        ) {
          return this.deviceService.sendCustomCommand(
            this.groupId(),
            d.deviceId,
            deviceCustomCommandRequest,
          );
        }

        if (d.geofenceId !== null) {
          deviceCustomCommandRequest.value = d.geofenceId!;

          return this.deviceService.sendCustomCommand(
            this.groupId(),
            d.deviceId,
            deviceCustomCommandRequest,
          );
        }

        return null;
      })
      .filter((r) => r !== null) as Observable<Response<SuccessResponse>>[];

    if ($customCommandRequests.length === 0) {
      this.hideActionDialog();
      this.loadingService.dismissLoading();
    }

    forkJoin($customCommandRequests).subscribe({
      next: (_: Response<SuccessResponse>[]) => {
        if (
          deviceCustomCommandRequest.deviceCustomCommand ===
          DeviceCustomCommand.DEACTIVATE_GEOFENCE
        ) {
          this.devices.update((devices) =>
            devices.map((d) => {
              if (this.selectedDevices().includes(d)) {
                d.geofenceId = null;
              }

              return d;
            }),
          );
        } else if (
          deviceCustomCommandRequest.deviceCustomCommand ===
          DeviceCustomCommand.ACTIVATE_GEOFENCE
        ) {
          this.devices.update((devices) =>
            devices.map((d) => {
              if (this.selectedDevices().includes(d)) {
                d.geofenceId = deviceCustomCommandRequest.value;
              }

              return d;
            }),
          );
        } else if (
          deviceCustomCommandRequest.deviceCustomCommand ===
          DeviceCustomCommand.DEACTIVATE_REMOTE_CONTROL
        ) {
          this.devices.update((devices) =>
            devices.map((d) => {
              if (this.selectedDevices().includes(d)) {
                d.remoteControlActive = false;
              }

              return d;
            }),
          );
        } else if (
          deviceCustomCommandRequest.deviceCustomCommand ===
          DeviceCustomCommand.ACTIVATE_REMOTE_CONTROL
        ) {
          this.devices.update((devices) =>
            devices.map((d) => {
              if (this.selectedDevices().includes(d)) {
                d.remoteControlActive = true;
              }

              return d;
            }),
          );
        }
        this.hideActionDialog();
        this.loadingService.dismissLoading();
      },
      error: (err: any) => {
        console.error('error:', err);
        this.loadingService.dismissLoading();
      },
    });
  }
}

type ActionTypeDialog =
  | 'hidden'
  | 'policies'
  | 'command'
  | 'customCommand'
  | 'migrate'
  | 'delete';
