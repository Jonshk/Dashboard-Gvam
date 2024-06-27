import { Routes } from '@angular/router';
import { authRoutes } from './pages/auth/auth.routes';
import { dashboardRoutes } from './pages/dashboard/dashboard.routes';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'groups',
    pathMatch: 'full',
  },
  ...authRoutes,
  ...dashboardRoutes,
];
