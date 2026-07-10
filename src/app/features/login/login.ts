import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthStore } from '../../core/state/auth-store';

@Component({
  selector: 'app-login',
  imports: [RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  readonly username = signal('');
  readonly password = signal('');
  readonly error = signal<string | null>(null);

  async submit(): Promise<void> {
    const success = await this.auth.login(this.username(), this.password());
    if (success) {
      void this.router.navigateByUrl('/');
      return;
    }
    this.error.set('Неверный логин или пароль.');
  }
}
