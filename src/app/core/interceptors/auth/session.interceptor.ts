import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpStatusCode,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { StoreService } from '../../services/store/store.service';
import { AuthService } from '../../services/auth/auth.service';
import { Response } from '../../models/response/response.model';
import { TokenResponse } from '../../models/response/token-response.model';

export const sessionInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const storeService = inject(StoreService);
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== HttpStatusCode.Unauthorized) {
        return throwError(() => err);
      }

      if (req.url.includes('/api/login') || req.url.includes('/api/register')) {
        return throwError(() => err);
      }

      if (req.url.includes('/api/refresh-token') || !authService.hasTokens()) {
        clearStorageAndNavigateToLogin(storeService, router);
        return throwError(() => 'Error al refrescar');
      }

      return handleRefreshToken(req, next, storeService, authService, router);
    }),
  );
};

function clearStorageAndNavigateToLogin(
  storeService: StoreService,
  router: Router,
) {
  storeService.clear();
  router.navigate(['/login']);
}

function handleRefreshToken(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  storeService: StoreService,
  authService: AuthService,
  router: Router,
): Observable<HttpEvent<unknown>> {
  const tokens = authService.getTokens()!;

  return authService.refreshToken(tokens.refreshToken).pipe(
    switchMap(({ data }: Response<TokenResponse>) => {
      authService.saveTokens(data);
      const authRequest = addAuthHeader(req, data.accessToken);

      return next(authRequest);
    }),
    catchError((err: any) => {
      clearStorageAndNavigateToLogin(storeService, router);
      return throwError(() => err);
    }),
  );
}

function addAuthHeader(req: HttpRequest<unknown>, accessToken: string) {
  return req.clone({
    headers: req.headers.set('Authorization', `Bearer ${accessToken}`),
  });
}
