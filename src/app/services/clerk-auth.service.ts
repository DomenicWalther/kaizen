import { Injectable, computed, inject } from '@angular/core';
import { ClerkAuthProvider } from 'convex-angular';
import { ClerkService } from './clerk.service';

@Injectable({
  providedIn: 'root',
})
export class ClerkAuthService implements ClerkAuthProvider {
  private clerk = inject(ClerkService);

  readonly isLoaded = computed(() => this.clerk.loaded());
  readonly isSignedIn = computed(() => !!this.clerk.user());

  async getToken(options?: { template?: string; skipCache?: boolean }) {
    try {
      return (await this.clerk.getToken(options)) ?? null;
    } catch {
      return null;
    }
  }
}
