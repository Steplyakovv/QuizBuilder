import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideNativeDateAdapter } from '@angular/material/core';

import { routes } from './app.routes';
import { QUIZ_REPOSITORY } from './core/repositories/quiz-repository';
import { LocalStorageQuizRepository } from './core/repositories/local-storage-quiz-repository';
import { ATTEMPT_REPOSITORY } from './core/repositories/attempt-repository';
import { LocalStorageAttemptRepository } from './core/repositories/local-storage-attempt-repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideNativeDateAdapter(),
    { provide: QUIZ_REPOSITORY, useClass: LocalStorageQuizRepository },
    { provide: ATTEMPT_REPOSITORY, useClass: LocalStorageAttemptRepository },
  ],
};
