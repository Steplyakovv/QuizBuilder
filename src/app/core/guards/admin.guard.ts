import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../state/auth-store';

export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  await auth.whenReady();
  if (auth.isAdmin()) {
    return true;
  }
  return router.createUrlTree(['/']);
};
