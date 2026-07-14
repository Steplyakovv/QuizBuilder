import { Injectable, effect, inject, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

const STORAGE_KEY = 'quiz-builder.language';

export type AppLanguage = 'ru' | 'en' | 'uk';

function readInitialLanguage(): AppLanguage {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'ru' || stored === 'en' || stored === 'uk' ? stored : 'ru';
}

@Injectable({ providedIn: 'root' })
export class LanguageStore {
  private readonly translocoService = inject(TranslocoService);
  private readonly languageState = signal<AppLanguage>(readInitialLanguage());

  readonly language = this.languageState.asReadonly();

  constructor() {
    this.translocoService.setActiveLang(this.languageState());
    effect(() => {
      const language = this.languageState();
      this.translocoService.setActiveLang(language);
      localStorage.setItem(STORAGE_KEY, language);
    });
  }

  setLanguage(language: AppLanguage): void {
    this.languageState.set(language);
  }
}
