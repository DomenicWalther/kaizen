import { Injectable, signal } from '@angular/core';
import { Clerk } from '@clerk/clerk-js';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ClerkService {
  public clerk: Clerk;

  public loaded = signal<boolean>(false);
  public user = signal<any>(null);
  constructor() {
    this.clerk = new Clerk(environment.clerkPublicKey);
    this.init();
  }

  private async init() {
    await this.clerk.load();
    this.loaded.set(true);

    this.clerk.addListener(() => {
      this.user.set(this.clerk.user ?? null);
    });
  }
  async openSignIn() {
    await this.clerk.openSignIn();
  }

  async isLoaded(): Promise<void> {
    await this.clerk.load();
  }

  async openSignUp() {
    await this.clerk.openSignUp();
  }

  async signOut() {
    await this.clerk.signOut();
    this.user.set(null);
  }

  async getToken(options?: { template?: string; skipCache?: boolean }): Promise<string | null> {
    const token = await this.clerk.session?.getToken(options);
    return token ?? null;
  }
}
