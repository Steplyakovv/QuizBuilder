import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthStore } from '../../core/state/auth-store';
import { Login } from './login';

describe('Login', () => {
  async function createComponent() {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(Login);
    await fixture.whenStable();
    return fixture;
  }

  beforeEach(() => {
    localStorage.clear();
  });

  it('logs in and navigates to the quiz list on correct credentials', async () => {
    const fixture = await createComponent();
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl');

    fixture.componentInstance.username.set('admin');
    fixture.componentInstance.password.set('admin');
    fixture.componentInstance.submit();

    expect(TestBed.inject(AuthStore).isAdmin()).toBe(true);
    expect(navigateSpy).toHaveBeenCalledWith('/');
  });

  it('shows an error and stays logged out on incorrect credentials', async () => {
    const fixture = await createComponent();

    fixture.componentInstance.username.set('admin');
    fixture.componentInstance.password.set('wrong');
    fixture.componentInstance.submit();

    expect(fixture.componentInstance.error()).toBe('Неверный логин или пароль.');
    expect(TestBed.inject(AuthStore).isAdmin()).toBe(false);
  });
});
