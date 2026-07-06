import { AuthStore } from './auth-store';

describe('AuthStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts out logged out', () => {
    const store = new AuthStore();
    expect(store.isAdmin()).toBe(false);
  });

  it('logs in with the correct demo credentials', () => {
    const store = new AuthStore();
    expect(store.login('admin', 'admin')).toBe(true);
    expect(store.isAdmin()).toBe(true);
  });

  it('rejects incorrect credentials', () => {
    const store = new AuthStore();
    expect(store.login('admin', 'wrong')).toBe(false);
    expect(store.isAdmin()).toBe(false);
  });

  it('persists the admin session across store instances', () => {
    const store = new AuthStore();
    store.login('admin', 'admin');

    const anotherStore = new AuthStore();
    expect(anotherStore.isAdmin()).toBe(true);
  });

  it('clears the session on logout', () => {
    const store = new AuthStore();
    store.login('admin', 'admin');

    store.logout();

    expect(store.isAdmin()).toBe(false);
    expect(new AuthStore().isAdmin()).toBe(false);
  });
});
