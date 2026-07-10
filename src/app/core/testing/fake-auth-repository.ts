import { AuthRepository } from '../repositories/auth-repository';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin';

export class FakeAuthRepository implements AuthRepository {
  private loggedIn = false;

  async login(username: string, password: string): Promise<boolean> {
    this.loggedIn = username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
    return this.loggedIn;
  }

  async logout(): Promise<void> {
    this.loggedIn = false;
  }

  async me(): Promise<boolean> {
    return this.loggedIn;
  }
}
