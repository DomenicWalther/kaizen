import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  CLERK_AUTH,
  CONVEX_AUTH_GUARD_CONFIG,
  provideClerkAuth,
  provideConvex,
} from 'convex-angular';

import { routes } from './app.routes';
import { ClerkAuthService } from './services/clerk-auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideConvex('https://robust-seal-771.convex.cloud'),
    { provide: CLERK_AUTH, useClass: ClerkAuthService },
    provideClerkAuth(),
    { provide: CONVEX_AUTH_GUARD_CONFIG, useValue: { loginRoute: '/auth/login' } },
  ],
};
