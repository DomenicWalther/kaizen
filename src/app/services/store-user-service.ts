import { effect, inject, Injectable } from '@angular/core';
import { ClerkService } from './clerk.service';
import { ClerkAuthService } from './clerk-auth.service';
import { injectMutation } from 'convex-angular';
import { api } from '../../../convex/_generated/api';
@Injectable({
  providedIn: 'root',
})
export class StoreUserService {
  private convex = inject(ClerkAuthService); // Assuming ConvexService is the service to interact with Convex
  private clerk = inject(ClerkService); // Assuming ClerkService is the service to interact with Clerk

  private stored = false;
  private storing = false;

  storeUserMutation = injectMutation(api.users.store);
  constructor() {
    effect(() => {
      const isAuthed = this.convex.isSignedIn();
      const user = this.clerk.user();

      if (!isAuthed || !user) {
        this.stored = false;
        return;
      }

      this.storeOnce();
    });
  }

  private async storeOnce() {
    if (this.stored || this.storing) {
      return;
    }
    this.storing = true;
    try {
      await this.storeUserMutation.mutate({});
      this.stored = true;
    } finally {
      this.storing = false;
    }
  }
}
