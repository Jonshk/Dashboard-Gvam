import { Routes } from '@angular/router';
import { isLoggedGuard } from '../../core/guards/auth.guard';
import { hasEnterpriseGuard } from '../../core/guards/has-enterprise.guard';
import { isIdNumberGuard } from '../../core/guards/is-id-number.guard';
import { DeviceDetailPage } from './device-detail/device-detail.page';
import { DevicesPage } from './devices/devices.page';
import { EnterprisePage } from './enterprise/enterprise.page';
import { GroupsPage } from './groups/groups.page';
import { PoliciesPage } from './policies/policies.page';

export const dashboardRoutes: Routes = [
  {
    path: 'enterprises',
    component: EnterprisePage,
    canActivate: [isLoggedGuard, hasEnterpriseGuard],
  },
  {
    path: 'groups',
    component: GroupsPage,
    canActivate: [isLoggedGuard, hasEnterpriseGuard],
  },
  {
    path: 'groups/:groupId/devices',
    component: DevicesPage,
    canMatch: [isIdNumberGuard(1)],
    canActivate: [isLoggedGuard, hasEnterpriseGuard],
  },
  {
    path: 'groups/:groupId/devices/:deviceId',
    component: DeviceDetailPage,
    canMatch: [isIdNumberGuard(1), isIdNumberGuard(3)],
    canActivate: [isLoggedGuard, hasEnterpriseGuard],
  },
  {
    path: 'groups/:groupId/policies',
    component: PoliciesPage,
    canMatch: [isIdNumberGuard(1)],
    canActivate: [isLoggedGuard, hasEnterpriseGuard],
  },
];
