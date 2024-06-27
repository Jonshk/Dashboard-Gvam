import { Routes } from '@angular/router';
import { LoginPage } from './pages/auth/login/login.page';
import { RegisterPage } from './pages/auth/register/register.page';
import { EnterprisePage } from './pages/dashboard/enterprise/enterprise.page';
import { GroupsPage } from './pages/dashboard/groups/groups.page';
import { DevicesPage } from './pages/dashboard/devices/devices.page';
import { PoliciesPage } from './pages/dashboard/policies/policies.page';
import { isLoggedGuard, isNotLoggedGuard } from './core/guards/auth.guard';
import { hasEnterpriseGuard } from './core/guards/has-enterprise.guard';
import { isIdNumberGuard } from './core/guards/is-id-number.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'groups',
    pathMatch: 'full',
  },
  {
    path: 'register',
    component: RegisterPage,
    canActivate: [isNotLoggedGuard],
  },
  {
    path: 'login',
    component: LoginPage,
    canActivate: [isNotLoggedGuard],
  },
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
    path: 'groups/:groupId/policies',
    component: PoliciesPage,
    canMatch: [isIdNumberGuard(1)],
    canActivate: [isLoggedGuard, hasEnterpriseGuard],
  },
];
