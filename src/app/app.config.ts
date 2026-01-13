import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { CLERK_AUTH, provideClerkAuth, provideConvex } from 'convex-angular';

import { routes } from './app.routes';
import { ClerkAuthService } from './services/clerk-auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideConvex('http://127.0.0.1:3210'),
    { provide: CLERK_AUTH, useClass: ClerkAuthService },
    provideClerkAuth(),
  ],
};
