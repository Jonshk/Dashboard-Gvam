import { Component, effect, inject, input, output } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InstallType } from '../../../../../core/enums/install-type';
import { PermissionPolicy } from '../../../../../core/enums/permission-policy';
import { AutoUpdateMode } from '../../../../../core/enums/auto-update-mode';
import { WifiState } from '../../../../../core/enums/wifi-state';
import { LocationMode } from '../../../../../core/enums/location-mode';
import { PowerButtonAction } from '../../../../../core/enums/power-button-action';
import { UsbDataAccess } from '../../../../../core/enums/usb-data-access';
import { WifiSsidPolicyType } from '../../../../../core/enums/wifi-ssid-policy-type';
import { PolicyService } from '../../../../../core/services/policy/policy.service';
import { Policy } from '../../../../../core/models/response/policy.model';
import { Response } from '../../../../../core/models/response/response.model';
import { LoadingService } from '../../../../../core/services/loading/loading.service';

@Component({
  selector: 'app-policy-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './policy-form.component.html',
  styleUrl: './policy-form.component.scss',
})
export class PolicyFormComponent {
  readonly groupId = input.required<number>();
  readonly isVisible = input.required<boolean>();
  readonly editPolicy = input<Policy | null>(null);

  readonly policy = output<Policy>();

  private formBuilder = inject(FormBuilder);
  private policyService = inject(PolicyService);
  readonly loadingService = inject(LoadingService);

  private defaultFormValues = {
    name: '',
    isDefault: false,
    applicationPolicy: [],
    wifiState: WifiState.UNSPECIFIED,
    wifiSsidPolicy: {
      wifiSsidPolicyType: WifiSsidPolicyType.UNSPECIFIED,
      wifiSsids: [],
    },
    locationMode: LocationMode.UNSPECIFIED,
    bluetoothDisabled: false,
    adjustVolumeDisabled: false,
    powerButtonAction: PowerButtonAction.UNSPECIFIED,
    usbDataAccess: UsbDataAccess.UNSPECIFIED,
    factoryResetDisabled: false,
    installAppsDisabled: false,
  };

  policyForm = this.formBuilder.group({
    name: [
      this.defaultFormValues.name,
      [Validators.required, Validators.pattern(new RegExp('^[a-zA-Z0-9]*$'))],
    ],
    isDefault: [this.defaultFormValues.isDefault],
    applicationPolicies: this.formBuilder.array(
      this.defaultFormValues.applicationPolicy,
    ),
    wifiState: [this.defaultFormValues.wifiState],
    wifiSsidPolicy: this.formBuilder.group({
      wifiSsidPolicyType: [
        this.defaultFormValues.wifiSsidPolicy.wifiSsidPolicyType,
      ],
      wifiSsids: this.formBuilder.array(
        this.defaultFormValues.wifiSsidPolicy.wifiSsids,
      ),
    }),
    locationMode: [this.defaultFormValues.locationMode],
    bluetoothDisabled: [this.defaultFormValues.bluetoothDisabled],
    adjustVolumeDisabled: [this.defaultFormValues.adjustVolumeDisabled],
    powerButtonAction: [this.defaultFormValues.powerButtonAction],
    usbDataAccess: [this.defaultFormValues.usbDataAccess],
    factoryResetDisabled: [this.defaultFormValues.factoryResetDisabled],
    installAppsDisabled: [this.defaultFormValues.installAppsDisabled],
  });

  private setEditForm = effect(() => {
    this.resetForm();
    if (this.editPolicy()) {
      this.policyForm.controls.name.setValue(this.editPolicy()!.name);
      this.policyForm.controls.name.disable();

      this.policyForm.controls.isDefault.setValue(
        this.editPolicy()!.isDefault ?? this.defaultFormValues.isDefault,
      );

      this.editPolicy()!.applicationPolicies.forEach((appPolicy) => {
        const applicationPolicyForm = this.newApplicationPolicy();
        applicationPolicyForm.controls.packageName.setValue(
          appPolicy.packageName,
        );
        applicationPolicyForm.controls.installType.setValue(
          appPolicy.installType ?? InstallType.UNSPECIFIED,
        );
        applicationPolicyForm.controls.defaultPermissionPolicy.setValue(
          appPolicy.defaultPermissionPolicy ?? PermissionPolicy.UNSPECIFIED,
        );
        applicationPolicyForm.controls.disabled.setValue(
          appPolicy.disabled ?? false,
        );
        applicationPolicyForm.controls.autoUpdateMode.setValue(
          appPolicy.autoUpdateMode ?? AutoUpdateMode.UNSPECIFIED,
        );

        this.applicationPolicy.push(applicationPolicyForm);
      });

      this.policyForm.controls.wifiState.setValue(
        this.editPolicy()!.wifiState ?? this.defaultFormValues.wifiState,
      );

      this.policyForm.controls.wifiSsidPolicy.controls.wifiSsidPolicyType.setValue(
        this.editPolicy()!.wifiSsidPolicy?.wifiSsidPolicyType ??
          this.defaultFormValues.wifiSsidPolicy.wifiSsidPolicyType,
      );
      this.editPolicy()!.wifiSsidPolicy?.wifiSsids.forEach((ssid) => {
        const ssidForm = this.formBuilder.control(ssid);

        this.wifiSsids.push(ssidForm);
      });

      this.policyForm.controls.locationMode.setValue(
        this.editPolicy()!.locationMode ?? this.defaultFormValues.locationMode,
      );

      this.policyForm.controls.bluetoothDisabled.setValue(
        this.editPolicy()!.bluetoothDisabled ??
          this.defaultFormValues.bluetoothDisabled,
      );

      this.policyForm.controls.adjustVolumeDisabled.setValue(
        this.editPolicy()!.adjustVolumeDisabled ??
          this.defaultFormValues.adjustVolumeDisabled,
      );

      this.policyForm.controls.powerButtonAction.setValue(
        this.editPolicy()!.powerButtonAction ??
          this.defaultFormValues.powerButtonAction,
      );

      this.policyForm.controls.usbDataAccess.setValue(
        this.editPolicy()!.usbDataAccess ??
          this.defaultFormValues.usbDataAccess,
      );

      this.policyForm.controls.factoryResetDisabled.setValue(
        this.editPolicy()!.factoryResetDisabled ??
          this.defaultFormValues.factoryResetDisabled,
      );

      this.policyForm.controls.installAppsDisabled.setValue(
        this.editPolicy()!.installAppsDisabled ??
          this.defaultFormValues.installAppsDisabled,
      );
    }
  });

  private resetForm() {
    this.policyForm.reset(this.defaultFormValues);
    this.policyForm.controls.name.enable();
    this.applicationPolicy.clear();
    this.wifiSsids.clear();
  }

  private resetOnHide = effect(() => {
    if (!this.isVisible()) {
      this.resetForm();
    }
  });

  onSubmit() {
    if (this.policyForm.invalid) return;

    this.loadingService.setLoading();

    const policy: Policy = this.policyForm.value as Policy;

    if (this.editPolicy()) {
      policy.name = this.editPolicy()!.name;
      this.editCurrentPolicy(policy);
      return;
    }

    this.createPolicy(policy);
  }

  private createPolicy(newPolicy: Policy) {
    this.policyService.create(this.groupId(), newPolicy).subscribe({
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

  private editCurrentPolicy(editedPolicy: Policy) {
    this.policyService.update(this.groupId(), editedPolicy).subscribe({
      next: ({ data }: Response<Policy>) => {
        this.policy.emit(data);
        this.loadingService.dismissLoading();
      },
      error: (err: any) => {
        console.error('error:', err);
        this.loadingService.dismissLoading();
      },
    });
  }

  get policyName() {
    return this.policyForm.get('name');
  }

  readonly applicationPolicy = this.policyForm.get(
    'applicationPolicies',
  ) as FormArray;

  private newApplicationPolicy() {
    return this.formBuilder.group({
      packageName: ['', [Validators.required]],
      installType: [InstallType.UNSPECIFIED],
      defaultPermissionPolicy: [PermissionPolicy.UNSPECIFIED],
      disabled: [false],
      autoUpdateMode: [AutoUpdateMode.UNSPECIFIED],
    });
  }

  addApplicationPolicy() {
    this.applicationPolicy.push(this.newApplicationPolicy());
  }

  removeApplicationPolicy(index: number) {
    this.applicationPolicy.removeAt(index);
  }

  readonly wifiSsids = this.policyForm
    .get('wifiSsidPolicy')!
    .get('wifiSsids') as FormArray;

  addWifiSsid() {
    const newWifiSsid = this.formBuilder.control('', [Validators.required]);

    this.wifiSsids.push(newWifiSsid);
  }

  removeWifiSsid(index: number) {
    this.wifiSsids.removeAt(index);
  }

  readonly InstallType = InstallType;
  readonly installTypeKeys = Object.keys(InstallType) as [
    keyof typeof InstallType,
  ];

  readonly PermissionPolicy = PermissionPolicy;
  readonly permissionPolicyKeys = Object.keys(PermissionPolicy) as [
    keyof typeof PermissionPolicy,
  ];

  readonly AutoUpdateMode = AutoUpdateMode;
  readonly autoUpdateModeKeys = Object.keys(AutoUpdateMode) as [
    keyof typeof AutoUpdateMode,
  ];

  readonly WifiState = WifiState;
  readonly wifiStateKeys = Object.keys(WifiState) as [keyof typeof WifiState];

  readonly WifiSsidPolicyType = WifiSsidPolicyType;
  readonly wifiSsidPolicyTypeKeys = Object.keys(WifiSsidPolicyType) as [
    keyof typeof WifiSsidPolicyType,
  ];

  readonly LocationMode = LocationMode;
  readonly locationModeKeys = Object.keys(LocationMode) as [
    keyof typeof LocationMode,
  ];

  readonly PowerButtonAction = PowerButtonAction;
  readonly powerButtonActionKeys = Object.keys(PowerButtonAction) as [
    keyof typeof PowerButtonAction,
  ];

  readonly UsbDataAccess = UsbDataAccess;
  readonly usbDataAccesKeys = Object.keys(UsbDataAccess) as [
    keyof typeof UsbDataAccess,
  ];
}
