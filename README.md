# Quiz Builder

[![CI](https://github.com/Steplyakovv/QuizBuilder/actions/workflows/ci.yml/badge.svg)](https://github.com/Steplyakovv/QuizBuilder/actions/workflows/ci.yml)

Конструктор опросников: разные типы вопросов (одиночный/множественный выбор,
текст, выбор картинки и др.), сборка опросника, прохождение и результаты.
Angular-фронтенд + ASP.NET Core backend с PostgreSQL.

Спецификация: [docs/SPEC.md](docs/SPEC.md). План работы: [docs/ROADMAP.md](docs/ROADMAP.md).
Правила разработки: [CLAUDE.md](CLAUDE.md).

## Стек

Angular 22 (standalone, zoneless) · Angular Material + CDK · Signals ·
Vitest · Playwright · ESLint + Prettier · Node 24 LTS · ASP.NET Core (.NET 10) ·
EF Core + PostgreSQL

## Команды (фронтенд)

```bash
npm install          # установка зависимостей
npm start             # dev-сервер, http://localhost:4200
npm run build          # production build
npm test                # unit-тесты (Vitest)
npm run test:e2e         # e2e-тесты (Playwright), нужен запущенный backend
npm run lint               # ESLint
npm run format               # Prettier --write
```

## Backend

Требуется .NET 10 SDK и локальный PostgreSQL (БД/роль `quizbuilder`/`quizbuilder`,
либо `docker compose -f server/docker-compose.yml up -d`, если доступен Docker).

```bash
cd server/QuizBuilder.Api
dotnet run --launch-profile http   # http://localhost:5131, применяет миграции
                                    # и сеет admin/admin при первом старте
```

Подробнее об архитектуре backend — раздел [Backend](CLAUDE.md#backend) в CLAUDE.md.
