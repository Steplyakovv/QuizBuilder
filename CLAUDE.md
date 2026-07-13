# Quiz Builder — правила разработки

Конструктор опросников на Angular + backend на ASP.NET Core. Полная спецификация —
[docs/SPEC.md](docs/SPEC.md), план работы — [docs/ROADMAP.md](docs/ROADMAP.md).

## Команды

Фронтенд (из корня репозитория):

```
npm start          # ng serve, http://localhost:4200
npm run build       # production build
npm test            # unit-тесты (Vitest)
npm run test:e2e    # e2e-тесты (Playwright) — требуют запущенный backend, см. ниже
npm run lint         # ESLint
npm run format        # Prettier --write
npm run format:check  # Prettier --check
```

Backend (из `server/QuizBuilder.Api`, нужен .NET 10 SDK и локальный PostgreSQL —
см. [Backend](#backend) ниже):

```
dotnet run --launch-profile http   # API, http://localhost:5131 (применяет миграции
                                    # и сеет admin/admin при первом старте)
dotnet ef migrations add <Name>    # новая миграция после правки моделей/DbContext
dotnet ef database update          # применить миграции вручную
dotnet test                        # backend unit-тесты (из server/ или server/QuizBuilder.slnx)
```

Перед тем как считать задачу законченной: `npm run lint`, `npm test`,
`npm run build` должны быть зелёными; для правок в `server/` — ещё и
`dotnet test`. Для UI-изменений — дополнительно `npm run test:e2e` (backend
должен быть запущен) или ручная проверка в браузере.

## Архитектура

- **Standalone components everywhere**, NgModule не используем.
- **Zoneless** — приложение без Zone.js. Не добавлять `zone.js` в зависимости.
  Изменения состояния должны идти через Signals или события шаблона, чтобы
  change detection триггерился корректно.
- **State**: Angular Signals + сервисы (`signal`, `computed`, `effect`).
  NgRx не используем, пока сложность реально не потребует.
- **DI**: функция `inject()` вместо конструкторной инъекции.
- **Шаблоны**: новый control flow (`@if`, `@for`, `@switch`), не `*ngIf`/`*ngFor`.
- **Структура папок** — по фичам (feature-based), не по техническому типу файла:
  ```
  src/app/
    core/            # синглтон-сервисы, репозитории, доменные типы
    shared/           # переиспользуемые презентационные компоненты, pipes, directives
    features/
      quiz-list/
      quiz-editor/
        question-editors/
      quiz-runner/      # прохождение опросника респондентом
  ```
- Слой хранения данных спрятан за интерфейсами (`QuizRepository`,
  `AttemptRepository`, `AuthRepository`) — компоненты и сторы работают только
  через них. Боевая реализация — HTTP-клиент к backend (`Http*Repository`,
  `src/app/core/repositories/`), в тестах подставляются `Fake*Repository`
  (`src/app/core/testing/`) через DI-токены.

## Backend

- `server/QuizBuilder.Api` — ASP.NET Core Web API (.NET 10, Minimal APIs),
  EF Core + Npgsql, PostgreSQL. Единственный источник правды — сервер: локальный
  `localStorage` в приложении не используется вообще.
- Полностью нормализованная реляционная схема (без JSON-блобов) — по таблице на
  сущность/дочернюю коллекцию (`questions` — TPH с дискриминатором `type`,
  `question_options`, `matching_pairs`, `hotspot_regions`, `fill_blank_answers`,
  ответы `question_responses` + дочерние таблицы). Снэпшот опросника на момент
  попытки (Phase 14) хранится в отдельных `attempt_*_snapshot` таблицах —
  точечная копия только тех строк, которые респондент видел, а не версионирование
  всего опросника.
- Один admin-аккаунт в БД (`admin_users`, пароль — PBKDF2-хэш), сессия — httpOnly
  cookie (`Microsoft.AspNetCore.Authentication.Cookies`). CORS разрешён только для
  `http://localhost:4200` с credentials.
- DTO (`Dto/`) зеркалят TS-модели из `quiz.models.ts` один в один (те же поля в
  camelCase), маппинг на EF-сущности — `Mapping/`. Сохранение опросника —
  полная замена вложенных вопросов/страниц на каждый `PUT` (delete + insert),
  а не diff — проще и соответствует прежнему контракту `QuizRepository.save()`.
- **CQRS через MediatR** — эндпоинты (`Endpoints/`) тонкие: парсят запрос,
  проверяют роль/консистентность route-параметров и диспатчат команду/запрос
  через `ISender`, вся логика (включая cookie-вход/выход через
  `IHttpContextAccessor` и dev-only `/api/test/reset`) — в
  `Features/<Entity>/*Command.cs` / `*Query.cs` (record + handler в одном
  файле). Авторизация намеренно осталась в эндпоинтах, а не в pipeline
  behavior — усложнение не оправдано для двух проверок роли.
- **AutoMapper** — для скалярных полей `Quiz`/`QuizAttempt`/`QuestionResponse`
  (профили в `Mapping/AutoMapperProfiles.cs`, обёрнуты в `IQuizMapper`/
  `IAttemptMapper`). Полиморфный маппинг `Question` ↔ `QuestionDto` (18
  конкретных типов через общий `QuestionFieldValues`) остаётся ручным в
  `QuestionMapper` (за интерфейсом `IQuestionMapper`, для единообразия с
  остальными мапперами) — discriminated-union fan-out плохо ложится на
  AutoMapper, переписывать его через 18 профилей было бы больше кода, чем
  сам маппер.
- Локальный Postgres поднят нативным Windows-сервисом (`quizbuilder`/`quizbuilder`,
  БД `quizbuilder`); `server/docker-compose.yml` — альтернатива через Docker,
  если он доступен (WSL2 не был доступен без перезагрузки на момент настройки).
- `POST /api/test/reset` — только в Development, чистит `quizzes`/`quiz_attempts`
  для изоляции e2e-тестов между прогонами (общая БД, не per-worker).
- Вебхуки — генерический outgoing webhook, не встроенная интеграция с
  конкретным сервисом: опциональный `settings.webhookUrl` на опроснике,
  `SubmitAttemptCommandHandler` после сохранения попытки зовёт
  `IAttemptWebhookSender.NotifyAsync` (`Features/Attempts/AttemptWebhookSender.cs`),
  который POST'ит JSON-пейлоад через типизированный `HttpClient` (таймаут 5с).
  Ошибки доставки (сеть/таймаут/не-2xx) ловятся и логируются внутри сендера,
  никогда не пробрасываются наружу — сломанный вебхук не может завалить
  сохранение попытки респондента.
- Email-отчёт о прохождении — глобальные SMTP-настройки и получатель хранятся
  в БД (`NotificationSettings`, одна строка, сидится в `DbInitializer`), а не
  в `appsettings`/user-secrets — редактируются на странице `/settings` в
  админке (`Features/Settings/`), без доступа к бэкенду. Пароль — plaintext
  (тот же прецедент, что и `Quiz.AccessPassword`), наружу через GET никогда
  не возвращается (только `HasPassword: bool`); пустое поле при сохранении
  значит «не менять пароль». `AttemptReportEmailSender.NotifyAsync`
  (вызывается при каждой попытке) молча глотает все ошибки доставки — как и
  вебхук. Отдельно `SendTestEmailAsync` (кнопка «Отправить тестовое письмо»)
  **не** глотает ошибку, а возвращает её текст в UI — чтобы не лезть в логи
  бэкенда, когда SMTP отклоняет логин/пароль.

## Стиль кода

- Простота важнее абстракций: не вводить паттерны/слои, которые не нужны
  прямо сейчас (см. общий принцип "не усложнять раньше времени").
- Файлы — kebab-case (Angular-дефолт), классы/интерфейсы — PascalCase.
- Комментарии — только там, где не очевидно "почему" (не "что").
- Форматирование — Prettier (`printWidth: 100`, одинарные кавычки), правки
  ESLint должны проходить без warn/error перед коммитом.

## Тестирование

- Unit-тесты (Vitest) — рядом с исходником (`*.spec.ts`), в первую очередь
  покрывают доменную логику (модели, репозиторий, стор, подсчёт баллов).
- E2E-тесты (Playwright) — в `tests/`, покрывают ключевые пользовательские
  сценарии из docs/SPEC.md (создание опросника, прохождение, экспорт/импорт).
- Backend unit-тесты (xUnit) — `server/QuizBuilder.Api.Tests/`, структура
  папок зеркалит `QuizBuilder.Api/` (`Mapping/`, `Features/<Entity>/`, `Auth/`).
  Мокаем через NSubstitute (не Moq — история с SponsorLink), без
  FluentAssertions (стал платным для не-OSS в 2025) — обычные `Assert.*`
  из xUnit. Хендлеры тестируются с реальными мапперами и
  `Microsoft.EntityFrameworkCore.InMemory` вместо моков — это тестирует
  логику хендлера (что нашлось/отфильтровалось/сохранилось), а не
  storage-специфичное поведение Postgres (для этого есть e2e). Из-за этого
  `ResetTestDataCommandHandler` (сырой `TRUNCATE`) тестами не покрыт — InMemory
  не умеет выполнять raw SQL, а команда и так гоняется e2e-прогонами на
  реальном Postgres.
- Не пишем тесты ради покрытия — тестируем поведение, которое может сломаться.

## Git

- Коммитить и мержить можно автоматически, без ожидания подтверждения —
  по завершении логического куска работы (например, фазы роадмапа) сразу
  создавать коммит. Не переписываем историю (`--amend`, `push --force`,
  `rebase -i`) без явного запроса.
- Формат сообщений — короткий, по-английски, в духе Conventional Commits
  (`feat:`, `fix:`, `chore:`, `test:`), тело — если нужно объяснить "почему".
- Ветка `main` — стабильная; для экспериментов заводить отдельные ветки, если
  задача рискованная (спросить пользователя, если не очевидно).
