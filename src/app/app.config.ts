import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { QUIZ_REPOSITORY } from './core/repositories/quiz-repository';
import { LocalStorageQuizRepository } from './core/repositories/local-storage-quiz-repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    { provide: QUIZ_REPOSITORY, useClass: LocalStorageQuizRepository },
  ],
};
