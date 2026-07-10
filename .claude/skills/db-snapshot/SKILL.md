---
description: Back up and restore the local Postgres dev data (quizzes/attempts) for QuizBuilder's backend. Use this before running the e2e suite (npm run test:e2e) or POST /api/test/reset whenever the user has manually-created data in the dev database worth keeping — restore right after the test run wipes it.
---

# DB snapshot (dev data)

`npm run test:e2e` resets the shared local Postgres database before every test
(`POST /api/test/reset`, dev-only — see `server/QuizBuilder.Api/Endpoints/TestSupportEndpoints.cs`),
truncating `quizzes` and `quiz_attempts` (cascades to everything under them:
questions, options, responses, attempt snapshots, etc.). `admin_users` is never
touched by the reset endpoint.

If the user has manually created quizzes/attempts in the running app that they
want to keep, back them up before running e2e (or anything that calls the reset
endpoint) and restore them right after.

## Usage

Backup (run once, whenever the user says their dev data is worth snapshotting —
re-running it overwrites the previous snapshot):

```powershell
powershell -File server/scripts/backup-dev-data.ps1
```

Restore (run after `npm run test:e2e` or any manual `POST /api/test/reset` call):

```powershell
powershell -File server/scripts/restore-dev-data.ps1
```

The snapshot lives at `server/backups/dev-data.dump` (gitignored, single file —
each backup overwrites the last, this isn't a history of snapshots).

## When to reach for this

- **Before running the e2e suite or the reset endpoint, if a snapshot already
  exists or the user has data worth keeping** → restore after, automatically,
  without being asked each time.
- **User says something like "бэкапь" / "снимай бэкап"** → run the backup script now.
- **No snapshot has been taken yet and the user hasn't asked for one** → don't
  restore (there's nothing to restore); mention that a snapshot would prevent
  data loss from the next e2e run if they want one.
