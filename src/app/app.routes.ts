import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/quiz-list/quiz-list').then((m) => m.QuizList),
  },
  {
    path: 'quiz/:id',
    loadComponent: () => import('./features/quiz-editor/quiz-editor').then((m) => m.QuizEditor),
  },
];
