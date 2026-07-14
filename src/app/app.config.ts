import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideTransloco } from '@jsverse/transloco';

import { routes } from './app.routes';
import { QUIZ_REPOSITORY } from './core/repositories/quiz-repository';
import { HttpQuizRepository } from './core/repositories/http-quiz-repository';
import { ATTEMPT_REPOSITORY } from './core/repositories/attempt-repository';
import { HttpAttemptRepository } from './core/repositories/http-attempt-repository';
import { AUTH_REPOSITORY } from './core/repositories/auth-repository';
import { HttpAuthRepository } from './core/repositories/http-auth-repository';
import { SETTINGS_REPOSITORY } from './core/repositories/settings-repository';
import { HttpSettingsRepository } from './core/repositories/http-settings-repository';
import { TranslocoHttpLoader } from './core/i18n/transloco-http-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch()),
    provideRouter(routes, withComponentInputBinding()),
    provideNativeDateAdapter(),
    provideTransloco({
      config: {
        availableLangs: ['ru', 'en', 'uk'],
        defaultLang: 'ru',
        fallbackLang: 'ru',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
    { provide: QUIZ_REPOSITORY, useClass: HttpQuizRepository },
    { provide: ATTEMPT_REPOSITORY, useClass: HttpAttemptRepository },
    { provide: AUTH_REPOSITORY, useClass: HttpAuthRepository },
    { provide: SETTINGS_REPOSITORY, useClass: HttpSettingsRepository },
  ],
};
