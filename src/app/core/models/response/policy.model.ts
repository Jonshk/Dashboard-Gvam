import { AutoUpdateMode } from '../../enums/auto-update-mode';
import { InstallType } from '../../enums/install-type';
import { LocationMode } from '../../enums/location-mode';
import { PermissionPolicy } from '../../enums/permission-policy';
import { PowerButtonAction } from '../../enums/power-button-action';
import { UsbDataAccess } from '../../enums/usb-data-access';
import { WifiSsidPolicyType } from '../../enums/wifi-ssid-policy-type';
import { WifiState } from '../../enums/wifi-state';

export interface Policy {
  name: string;
  applicationPolicies: ApplicationPolicy[];
  wifiState?: WifiState;
  wifiSsidPolicy?: WifiSsidPolicy;
  locationMode?: LocationMode;
  bluetoothDisabled?: boolean;
  adjustVolumeDisabled?: boolean;
  powerButtonAction?: PowerButtonAction;
  usbDataAccess?: UsbDataAccess;
  factoryResetDisabled?: boolean;
  installAppsDisabled?: boolean;
  isDefault?: boolean;
}
export interface WifiSsidPolicy {
  wifiSsidPolicyType: WifiSsidPolicyType;
  wifiSsids: string[];
}
export interface ApplicationPolicy {
  packageName: string;
  installType?: InstallType;
  defaultPermissionPolicy?: PermissionPolicy;
  disabled?: boolean;
  autoUpdateMode?: AutoUpdateMode;
}
