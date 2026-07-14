import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { translateSignal } from '@jsverse/transloco';
import { ThemeStore } from './core/state/theme-store';
import { AppLanguage, LanguageStore } from './core/state/language-store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatButtonModule, MatButtonToggleModule, MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly themeStore = inject(ThemeStore);
  private readonly languageStore = inject(LanguageStore);

  readonly theme = this.themeStore.theme;
  readonly language = this.languageStore.language;
  readonly languages: AppLanguage[] = ['ru', 'en', 'uk'];

  protected readonly switchToLightThemeLabel = translateSignal('common.switchToLightTheme');
  protected readonly switchToDarkThemeLabel = translateSignal('common.switchToDarkTheme');
  protected readonly languageSwitcherLabel = translateSignal('common.languageSwitcherLabel');

  toggleTheme(): void {
    this.themeStore.toggle();
  }

  setLanguage(language: AppLanguage): void {
    this.languageStore.setLanguage(language);
  }
}
