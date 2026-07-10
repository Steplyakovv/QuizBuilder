import { Injectable, inject, signal } from '@angular/core';
import { AUTH_REPOSITORY } from '../repositories/auth-repository';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly repository = inject(AUTH_REPOSITORY);
  private readonly isAdminState = signal(false);

  readonly isAdmin = this.isAdminState.asReadonly();

  /** Resolves once the initial session check (against the auth cookie) has completed. */
  private readonly readyPromise: Promise<void> = this.repository
    .me()
    .then((isAdmin) => this.isAdminState.set(isAdmin));

  async whenReady(): Promise<void> {
    return this.readyPromise;
  }

  async login(username: string, password: string): Promise<boolean> {
    const success = await this.repository.login(username, password);
    if (success) {
      this.isAdminState.set(true);
    }
    return success;
  }

  async logout(): Promise<void> {
    await this.repository.logout();
    this.isAdminState.set(false);
  }
}
