import { TestBed } from '@angular/core/testing';
import { AUTH_REPOSITORY } from '../repositories/auth-repository';
import { FakeAuthRepository } from '../testing/fake-auth-repository';
import { AuthStore } from './auth-store';

describe('AuthStore', () => {
  function createStore(): AuthStore {
    TestBed.configureTestingModule({
      providers: [{ provide: AUTH_REPOSITORY, useValue: new FakeAuthRepository() }],
    });
    return TestBed.inject(AuthStore);
  }

  it('starts out logged out', async () => {
    const store = createStore();
    await store.whenReady();
    expect(store.isAdmin()).toBe(false);
  });

  it('logs in with the correct demo credentials', async () => {
    const store = createStore();
    expect(await store.login('admin', 'admin')).toBe(true);
    expect(store.isAdmin()).toBe(true);
  });

  it('rejects incorrect credentials', async () => {
    const store = createStore();
    expect(await store.login('admin', 'wrong')).toBe(false);
    expect(store.isAdmin()).toBe(false);
  });

  it('picks up an already-logged-in server session on a fresh store instance', async () => {
    const repository = new FakeAuthRepository();
    await repository.login('admin', 'admin');

    TestBed.configureTestingModule({
      providers: [{ provide: AUTH_REPOSITORY, useValue: repository }],
    });
    const store = TestBed.inject(AuthStore);
    await store.whenReady();

    expect(store.isAdmin()).toBe(true);
  });

  it('clears the session on logout', async () => {
    const store = createStore();
    await store.login('admin', 'admin');

    await store.logout();

    expect(store.isAdmin()).toBe(false);
  });
});
