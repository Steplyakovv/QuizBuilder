import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { AuthStore } from '../state/auth-store';
import { adminGuard } from './admin.guard';

describe('adminGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  function runGuard(): boolean | ReturnType<Router['createUrlTree']> {
    return TestBed.runInInjectionContext(() => adminGuard({} as never, {} as never)) as
      boolean | ReturnType<Router['createUrlTree']>;
  }

  it('allows navigation when logged in as admin', () => {
    TestBed.inject(AuthStore).login('admin', 'admin');

    expect(runGuard()).toBe(true);
  });

  it('redirects to the quiz list when not an admin', () => {
    const router = TestBed.inject(Router);
    const result = runGuard();

    expect(result).toEqual(router.createUrlTree(['/']));
  });
});
