import { Injectable, effect, signal } from '@angular/core';

const STORAGE_KEY = 'quiz-builder.theme';

export type Theme = 'light' | 'dark';

function readInitialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  const prefersDark =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

@Injectable({ providedIn: 'root' })
export class ThemeStore {
  private readonly themeState = signal<Theme>(readInitialTheme());

  readonly theme = this.themeState.asReadonly();

  constructor() {
    effect(() => {
      const theme = this.themeState();
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem(STORAGE_KEY, theme);
    });
  }

  toggle(): void {
    this.themeState.set(this.themeState() === 'dark' ? 'light' : 'dark');
  }
}
