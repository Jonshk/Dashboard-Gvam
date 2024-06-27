import { Component, inject } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { routes } from './app.routes';
import { StoreService } from './core/services/store/store.service';
import { LoadingComponent } from './shared/components/loading/loading.component';
import { ErrorComponent } from './shared/components/error/error.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, LoadingComponent, ErrorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  routes = routes;

  private storeService = inject(StoreService);
  private router = inject(Router);

  logout() {
    this.storeService.clear();
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
