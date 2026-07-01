# Quiz Builder

Конструктор опросников на Angular: разные типы вопросов (одиночный/множественный
выбор, текст, выбор картинки и др.), сборка опросника, прохождение и результаты.

Спецификация: [docs/SPEC.md](docs/SPEC.md). План работы: [docs/ROADMAP.md](docs/ROADMAP.md).
Правила разработки: [CLAUDE.md](CLAUDE.md).

## Стек

Angular 22 (standalone, zoneless) · Angular Material + CDK · Signals ·
Vitest · Playwright · ESLint + Prettier · Node 24 LTS

## Команды

```bash
npm install          # установка зависимостей
npm start             # dev-сервер, http://localhost:4200
npm run build          # production build
npm test                # unit-тесты (Vitest)
npm run test:e2e         # e2e-тесты (Playwright)
npm run lint               # ESLint
npm run format               # Prettier --write
```
