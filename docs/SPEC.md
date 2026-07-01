# Quiz Builder — Спецификация (MVP)

## 1. Идея

Конструктор опросников: пользователь создаёт опросник, добавляет вопросы разных
типов, настраивает варианты ответов, публикует/сохраняет опросник и может
пройти его в режиме респондента. Приложение относительно простое —
без мультипользовательской модели и сложного бэкенда на первом этапе.

## 2. Стек

| Область | Выбор |
|---|---|
| Framework | Angular 22, standalone components, zoneless change detection |
| Реактивность | Angular Signals (без NgRx на старте) |
| UI-компоненты | Angular Material + CDK (в т.ч. Drag&Drop для сортировки вопросов) |
| Стили | SCSS |
| Данные (MVP) | localStorage через сервис-обёртку, экспорт/импорт в JSON |
| Unit-тесты | Vitest (дефолт Angular CLI 22) |
| E2E-тесты | Playwright |
| Линт/формат | ESLint (`@angular-eslint`) + Prettier |
| Пакетный менеджер | npm |
| Node.js | 24 LTS |

Бэкенд в MVP не нужен. Архитектура данных проектируется так, чтобы слой
хранения (`QuizRepository`) можно было позже заменить на HTTP-реализацию
без изменения компонентов.

## 3. Типы вопросов

### MVP
- **single-choice** — одиночный выбор (radio)
- **multiple-choice** — множественный выбор (checkbox)
- **text** — текстовый ответ (короткий / длинный)
- **image-choice** — выбор одной или нескольких картинок как ответа

### После MVP (backlog)
- **word-choice** — выбор/выделение слов в тексте (например, найти слова в
  предложении или расставить слова по местам)
- ranking / сортировка вариантов
- matching / сопоставление пар
- matrix (таблица вопрос×шкала)

## 4. Модель данных (черновик)

```ts
interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  settings: {
    isGraded: boolean;        // квиз с баллами vs обычный опрос
    shuffleQuestions?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

type Question =
  | SingleChoiceQuestion
  | MultipleChoiceQuestion
  | TextQuestion
  | ImageChoiceQuestion;

interface BaseQuestion {
  id: string;
  prompt: string;
  required: boolean;
}

interface Option {
  id: string;
  label: string;     // текст варианта
  imageUrl?: string;  // для image-choice
}

interface SingleChoiceQuestion extends BaseQuestion {
  type: 'single-choice';
  options: Option[];
  correctOptionId?: string; // только для isGraded
}

interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple-choice';
  options: Option[];
  correctOptionIds?: string[];
}

interface TextQuestion extends BaseQuestion {
  type: 'text';
  multiline: boolean;
  maxLength?: number;
}

interface ImageChoiceQuestion extends BaseQuestion {
  type: 'image-choice';
  multiple: boolean;
  options: Option[]; // label используется как alt-текст
  correctOptionIds?: string[];
}

interface QuizAttempt {
  id: string;
  quizId: string;
  startedAt: string;
  completedAt?: string;
  responses: QuestionResponse[];
  score?: number;
}

interface QuestionResponse {
  questionId: string;
  selectedOptionIds?: string[];
  text?: string;
}
```

## 5. Ключевые пользовательские сценарии

1. Создать опросник, задать название/описание.
2. Добавить вопрос выбранного типа, заполнить варианты ответов.
3. Изменить порядок вопросов (drag&drop).
4. Пометить правильные варианты (если это квиз с оценкой).
5. Посмотреть предпросмотр опросника.
6. Пройти опросник как респондент, получить результат (если graded).
7. Экспортировать опросник/результаты в JSON, импортировать обратно.

## 6. Нефункциональные требования

- Адаптивная вёрстка (desktop + планшет, mobile — best effort).
- Доступность: используем Angular Material (уже соответствует a11y-стандартам),
  корректные `aria-*` для кастомных элементов конструктора.
- Локализация: интерфейс на русском в MVP, архитектура не должна блокировать
  добавление i18n позже (тексты не хардкодим внутри глубоко вложенной логики).
- Никаких внешних сетевых вызовов в MVP — всё работает офлайн (localStorage).
