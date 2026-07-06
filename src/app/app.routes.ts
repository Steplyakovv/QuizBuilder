import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/quiz-list/quiz-list').then((m) => m.QuizList),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
  },
  {
    path: 'quiz/:id',
    loadComponent: () => import('./features/quiz-editor/quiz-editor').then((m) => m.QuizEditor),
    canActivate: [adminGuard],
  },
  {
    path: 'quiz/:id/run',
    loadComponent: () => import('./features/quiz-runner/quiz-runner').then((m) => m.QuizRunner),
  },
  {
    path: 'quiz/:id/results',
    loadComponent: () => import('./features/quiz-results/quiz-results').then((m) => m.QuizResults),
    canActivate: [adminGuard],
  },
];
