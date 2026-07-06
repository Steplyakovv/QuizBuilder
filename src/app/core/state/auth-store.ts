import { Injectable, signal } from '@angular/core';

const ADMIN_FLAG_KEY = 'quiz-builder.isAdmin';

// Demo-only gate: there is no backend, so this only hides/shows UI in the
// browser and can trivially be bypassed via devtools. Real access control
// needs a server (see Phase 7 backlog).
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly isAdminState = signal(localStorage.getItem(ADMIN_FLAG_KEY) === 'true');

  readonly isAdmin = this.isAdminState.asReadonly();

  login(username: string, password: string): boolean {
    const success = username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
    if (success) {
      this.isAdminState.set(true);
      localStorage.setItem(ADMIN_FLAG_KEY, 'true');
    }
    return success;
  }

  logout(): void {
    this.isAdminState.set(false);
    localStorage.removeItem(ADMIN_FLAG_KEY);
  }
}
