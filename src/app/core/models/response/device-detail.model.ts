export interface DeviceDetail {
  apiLevel: number;
  appliedPolicyName: string;
  appliedPolicyVersion: number;
  appliedState: string;
  disabledReason: DisabledReason;
  enrollmentTime: string;
  enrollmentTokenName: string;
  hardwareInfo: HardwareInfo;
  lastPolicySyncTime: string;
  lastStatusReportTime: string;
  managementMode: string;
  memoryInfo: MemoryInfo;
  name: string;
  ownership: string;
  policyCompliant: boolean;
  policyName: string;
  previousDeviceNames: string[];
  securityPosture: SecurityPosture;
  state: string;
  userName: string;
}

interface DisabledReason {}

interface HardwareInfo {
  brand: string;
  deviceBasebandVersion: string;
  hardware: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
}

interface MemoryInfo {
  totalInternalStorage: number;
  totalRam: number;
}

interface SecurityPosture {
  devicePosture: string;
}
