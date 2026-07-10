import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { AUTH_REPOSITORY } from '../repositories/auth-repository';
import { AuthStore } from '../state/auth-store';
import { FakeAuthRepository } from '../testing/fake-auth-repository';
import { adminGuard } from './admin.guard';

describe('adminGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AUTH_REPOSITORY, useValue: new FakeAuthRepository() },
      ],
    });
  });

  function runGuard() {
    return TestBed.runInInjectionContext(() => adminGuard({} as never, {} as never));
  }

  it('allows navigation when logged in as admin', async () => {
    await TestBed.inject(AuthStore).login('admin', 'admin');

    expect(await runGuard()).toBe(true);
  });

  it('redirects to the quiz list when not an admin', async () => {
    const router = TestBed.inject(Router);
    const result = await runGuard();

    expect(result).toEqual(router.createUrlTree(['/']));
  });
});
