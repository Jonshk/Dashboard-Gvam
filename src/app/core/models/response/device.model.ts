export interface Device {
  deviceName: string;
  policyName: string;
  deviceId: number;
  deviceUserId?: number;
  enrolled: boolean;
  geofenceId: number | null;
}
