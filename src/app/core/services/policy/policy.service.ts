import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Response } from '../../models/response/response.model';
import { Policy } from '../../models/response/policy.model';
import { Observable } from 'rxjs';
import { EnterpriseService } from '../enterprise/enterprise.service';
import { SuccessResponse } from '../../models/response/success-response.model';

@Injectable({
  providedIn: 'root',
})
export class PolicyService {
  private enterpriseId: string;

  private url(groupId: number, path: string | null = null) {
    return `${environment.apiUrl}/enterprises/${this.enterpriseId}/groups/${groupId}/policies${path ? '/' + path : ''}`;
  }

  constructor(
    private http: HttpClient,
    private enterpriseService: EnterpriseService,
  ) {
    this.enterpriseId = this.enterpriseService.getEnterpriseId() as string;
  }

  create(groupId: number, policy: Policy): Observable<Response<Policy>> {
    return this.http.post<Response<Policy>>(this.url(groupId), policy);
  }

  update(groupId: number, policy: Policy): Observable<Response<Policy>> {
    return this.http.patch<Response<Policy>>(this.url(groupId), policy);
  }

  list(groupId: number): Observable<Response<Policy[]>> {
    return this.http.get<Response<Policy[]>>(this.url(groupId));
  }

  find(groupId: number, policyName: string): Observable<Response<Policy>> {
    return this.http.get<Response<Policy>>(this.url(groupId, policyName));
  }

  delete(
    groupId: number,
    policyName: string,
  ): Observable<Response<SuccessResponse>> {
    return this.http.delete<Response<SuccessResponse>>(
      this.url(groupId, policyName),
    );
  }

  applyPolicyToGroup(
    groupId: number,
    policyName: string,
  ): Observable<Response<SuccessResponse>> {
    return this.http.patch<Response<SuccessResponse>>(
      this.url(groupId, policyName),
      {},
    );
  }
}
