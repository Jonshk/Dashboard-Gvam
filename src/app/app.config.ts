import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtHeaderInterceptor } from './core/interceptors/auth/jwt-header.interceptor';
import { sessionInterceptor } from './core/interceptors/auth/session.interceptor';
import { errorInterceptor } from './core/interceptors/error/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([
        jwtHeaderInterceptor,
        sessionInterceptor,
        errorInterceptor,
      ]),
    ),
  ],
};
