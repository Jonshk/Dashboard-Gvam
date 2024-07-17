import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { EnterpriseService } from '../../services/enterprise/enterprise.service';
import { StoreService } from '../../services/store/store.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  notAuthRoutes = [
    { path: 'login', name: 'Iniciar sesión' },
    { path: 'register', name: 'Registrarse' },
  ];
  authRoutes = [{ path: 'enterprises', name: 'Empresa' }];
  authAndEnterpriseRoutes = [{ path: 'groups', name: 'Grupos' }, {path: 'applications', name: 'Aplicaciones'}];

  constructor(
    readonly authService: AuthService,
    readonly enterpriseService: EnterpriseService,
    private storeService: StoreService,
    private router: Router,
  ) {}

  logout() {
    this.storeService.clear();
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
