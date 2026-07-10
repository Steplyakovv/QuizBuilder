import { InjectionToken } from '@angular/core';

export interface AuthRepository {
  login(username: string, password: string): Promise<boolean>;
  logout(): Promise<void>;
  /** Current session state as known by the server (e.g. on app startup, from the auth cookie). */
  me(): Promise<boolean>;
}

export const AUTH_REPOSITORY = new InjectionToken<AuthRepository>('AUTH_REPOSITORY');
