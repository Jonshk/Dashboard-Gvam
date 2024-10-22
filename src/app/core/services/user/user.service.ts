import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnterpriseService } from '../enterprise/enterprise.service';
import { environment } from '../../../../environments/environment';
import { SuccessResponse } from '../../models/response/success-response.model';
import { Response } from '../../models/response/response.model';
import { Observable } from 'rxjs';
import { CreateDeviceUserRequest } from '../../models/request/create-device-user-request.model';
import { DeviceUser } from '../../models/response/device-user.model';
import {
  getPaginationParams,
  NO_PAGINATION,
  Pagination,
} from '../../../shared/util/pagination';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private enterpriseId: string;

  private url(groupId: number, path: number | null = null) {
    return `${environment.apiUrl}/enterprises/${this.enterpriseId}/groups/${groupId}/users${path ? '/' + path : ''}`;
  }

  private urlAll(path: number | null = null) {
    return `${environment.apiUrl}/enterprises/${this.enterpriseId}/users${path ? '/' + path : ''}`;
  }

  constructor(
    private http: HttpClient,
    private enterpriseService: EnterpriseService,
  ) {
    this.enterpriseId = this.enterpriseService.getEnterpriseId() as string;
  }

  create(
    groupId: number,
    createDeviceUser: CreateDeviceUserRequest,
  ): Observable<Response<DeviceUser>> {
    return this.http.post<Response<DeviceUser>>(
      this.url(groupId),
      createDeviceUser,
    );
  }

  patch(
    groupId: number,
    deviceUserId: number,
    createDeviceUser: CreateDeviceUserRequest,
  ): Observable<Response<DeviceUser>> {
    return this.http.patch<Response<DeviceUser>>(
      this.url(groupId, deviceUserId),
      createDeviceUser,
    );
  }

  listAll(
    pagination: Pagination = NO_PAGINATION,
  ): Observable<Response<DeviceUser[]>> {
    return this.http.get<Response<DeviceUser[]>>(this.urlAll(), {
      params: getPaginationParams(pagination),
    });
  }

  list(
    groupId: number,
    pagination: Pagination = NO_PAGINATION,
  ): Observable<Response<DeviceUser[]>> {
    return this.http.get<Response<DeviceUser[]>>(this.url(groupId), {
      params: getPaginationParams(pagination),
    });
  }

  delete(
    groupId: number,
    deviceUserId: number,
  ): Observable<Response<SuccessResponse>> {
    return this.http.delete<Response<SuccessResponse>>(
      this.url(groupId, deviceUserId),
    );
  }
}
