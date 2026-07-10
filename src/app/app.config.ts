import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideNativeDateAdapter } from '@angular/material/core';

import { routes } from './app.routes';
import { QUIZ_REPOSITORY } from './core/repositories/quiz-repository';
import { HttpQuizRepository } from './core/repositories/http-quiz-repository';
import { ATTEMPT_REPOSITORY } from './core/repositories/attempt-repository';
import { HttpAttemptRepository } from './core/repositories/http-attempt-repository';
import { AUTH_REPOSITORY } from './core/repositories/auth-repository';
import { HttpAuthRepository } from './core/repositories/http-auth-repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch()),
    provideRouter(routes, withComponentInputBinding()),
    provideNativeDateAdapter(),
    { provide: QUIZ_REPOSITORY, useClass: HttpQuizRepository },
    { provide: ATTEMPT_REPOSITORY, useClass: HttpAttemptRepository },
    { provide: AUTH_REPOSITORY, useClass: HttpAuthRepository },
  ],
};
