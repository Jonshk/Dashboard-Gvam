import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { EnterpriseService } from '../enterprise/enterprise.service';
import { Observable } from 'rxjs';
import { Response } from '../../models/response/response.model';
import { SuccessResponse } from '../../models/response/success-response.model';
import { CreateGeofence } from '../../models/request/create-geofence.model';
import { Geofence } from '../../models/response/geofence.model';

@Injectable({
  providedIn: 'root',
})
export class GeofenceService {
  private enterpriseId: string;

  private url(groupId: number, path: number | null = null) {
    return `${environment.apiUrl}/enterprises/${this.enterpriseId}/groups/${groupId}/geofences${path ? '/' + path : ''}`;
  }

  constructor(
    private http: HttpClient,
    private enterpriseService: EnterpriseService,
  ) {
    this.enterpriseId = this.enterpriseService.getEnterpriseId() as string;
  }

  create(
    groupId: number,
    createGeofence: CreateGeofence,
  ): Observable<Response<Geofence>> {
    return this.http.post<Response<Geofence>>(
      this.url(groupId),
      createGeofence,
    );
  }

  update(
    groupId: number,
    geofenceId: number,
    updateGeofence: CreateGeofence,
  ): Observable<Response<Geofence>> {
    return this.http.patch<Response<Geofence>>(
      this.url(groupId, geofenceId),
      updateGeofence,
    );
  }

  list(groupId: number): Observable<Response<Geofence[]>> {
    return this.http.get<Response<Geofence[]>>(this.url(groupId));
  }

  find(groupId: number, geofenceId: number): Observable<Response<Geofence>> {
    return this.http.get<Response<Geofence>>(this.url(groupId, geofenceId));
  }

  delete(
    groupId: number,
    geofenceId: number,
  ): Observable<Response<SuccessResponse>> {
    return this.http.delete<Response<SuccessResponse>>(
      this.url(groupId, geofenceId),
    );
  }
}
