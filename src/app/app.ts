import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ThemeStore } from './core/state/theme-store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatButtonModule, MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly themeStore = inject(ThemeStore);

  readonly theme = this.themeStore.theme;

  toggleTheme(): void {
    this.themeStore.toggle();
  }
}
