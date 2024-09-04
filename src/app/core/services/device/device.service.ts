import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Response } from '../../models/response/response.model';
import { DeviceDetail } from '../../models/response/device-detail.model';
import { Observable } from 'rxjs';
import { EnterpriseService } from '../enterprise/enterprise.service';
import { EnrollDeviceRequest } from '../../models/request/enroll-device.model';
import { EnrollDeviceResponse } from '../../models/response/enroll-device-response.model';
import { RegisterDevice } from '../../models/response/register-device.model';
import { SuccessResponse } from '../../models/response/success-response.model';
import { ApplyDevicePolicyRequest } from '../../models/request/apply-device-policy-request.model';
import { Device } from '../../models/response/device.model';
import { DeviceCommandRequest } from '../../models/request/device-command-request.model';
import { MigrateDeviceRequest } from '../../models/request/migrate-device-request';
import { DeviceCustomCommandRequest } from '../../models/request/device-custom-command-request.model';
import { CobrowseToken } from '../../models/response/cobrowse-token.model';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  private enterpriseId: string;

  private url(groupId: number, path: string | number | null = null) {
    return `${environment.apiUrl}/enterprises/${this.enterpriseId}/groups/${groupId}/devices${path ? '/' + path : ''}`;
  }

  private urlAll(path: string | number | null = null) {
    return `${environment.apiUrl}/enterprises/${this.enterpriseId}/devices${path ? '/' + path : ''}`;
  }

  constructor(
    private http: HttpClient,
    private enterpriseService: EnterpriseService,
  ) {
    this.enterpriseId = this.enterpriseService.getEnterpriseId() as string;
  }

  enroll(
    groupId: number,
    registerDevice: EnrollDeviceRequest,
  ): Observable<Response<EnrollDeviceResponse>> {
    return this.http.post<Response<EnrollDeviceResponse>>(
      this.url(groupId, 'enroll'),
      registerDevice,
    );
  }

  update(
    groupId: number,
    deviceId: number,
    registerDevice: EnrollDeviceRequest,
  ): Observable<Response<Device>> {
    return this.http.patch<Response<Device>>(
      this.url(groupId, deviceId),
      registerDevice,
    );
  }

  register(groupId: number): Observable<Response<RegisterDevice>> {
    return this.http.post<Response<RegisterDevice>>(
      this.url(groupId, 'register'),
      {},
    );
  }

  list(groupId: number): Observable<Response<Device[]>> {
    return this.http.get<Response<Device[]>>(this.url(groupId));
  }

  
  listAll(): Observable<Response<Device[]>> {
    return this.http.get<Response<Device[]>>(this.urlAll());
  }

  find(groupId: number, deviceId: number): Observable<Response<DeviceDetail>> {
    return this.http.get<Response<DeviceDetail>>(this.url(groupId, deviceId));
  }

  delete(
    groupId: number,
    deviceId: number,
    enrolled: boolean,
  ): Observable<Response<SuccessResponse>> {
    return this.http.delete<Response<SuccessResponse>>(
      this.url(groupId, deviceId),
      { params: { enrolled } },
    );
  }

  applyPolicy(
    groupId: number,
    deviceId: number,
    devicePolicyRequest: ApplyDevicePolicyRequest,
  ): Observable<Response<SuccessResponse>> {
    return this.http.post<Response<SuccessResponse>>(
      this.url(groupId, deviceId),
      devicePolicyRequest,
    );
  }

  sendCommand(
    groupId: number,
    deviceId: number,
    deviceCommandRequest: DeviceCommandRequest,
  ): Observable<Response<SuccessResponse>> {
    return this.http.post<Response<SuccessResponse>>(
      this.url(groupId, deviceId + '/command'),
      deviceCommandRequest,
    );
  }

  sendCustomCommand(
    groupId: number,
    deviceId: number,
    deviceCustomCommandRequest: DeviceCustomCommandRequest,
  ): Observable<Response<SuccessResponse>> {
    return this.http.post<Response<SuccessResponse>>(
      this.url(groupId, deviceId + '/command/custom'),
      deviceCustomCommandRequest,
    );
  }

  migrate(
    groupId: number,
    deviceId: number,
    migrateDeviceRequest: MigrateDeviceRequest,
  ): Observable<Response<SuccessResponse>> {
    return this.http.post<Response<SuccessResponse>>(
      this.url(groupId, deviceId + '/migrate'),
      migrateDeviceRequest,
    );
  }

  getCowbroseToken(
    groupId: number,
    deviceId: number,
  ): Observable<Response<CobrowseToken>> {
    return this.http.get<Response<CobrowseToken>>(
      this.url(groupId, deviceId + '/remote-control/token'),
    );
  }
}
