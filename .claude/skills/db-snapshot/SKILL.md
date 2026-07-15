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

Backup (whenever the user says their dev data is worth snapshotting, and
**always before** running anything that calls the reset endpoint):

```powershell
powershell -File server/scripts/backup-dev-data.ps1
```

Restore (run after `npm run test:e2e` or any manual `POST /api/test/reset` call):

```powershell
powershell -File server/scripts/restore-dev-data.ps1
```

The snapshot lives at `server/backups/dev-data.dump` (gitignored). Each backup
rotates the previous file to `dev-data.dump.previous` before overwriting, so one
bad backup (e.g. taken right after an unnoticed reset) can't destroy the only
good copy — but it's still just one extra generation, not a history, so don't
rely on it for anything older than "the last backup before this one."

## Critical ordering rule

**Backup goes before a reset-triggering action, restore goes after it — never
run backup *after* a reset as if it were a substitute for restore.** A reset
(`npm run test:e2e`, or any direct `POST /api/test/reset`) truncates the data
first; if that already happened, the tables are empty and running backup at
that point just snapshots the empty state, permanently losing whatever was
there before (this happened once — see git history/CLAUDE.md context if
unsure). Before backing up, sanity-check that a reset hasn't already fired
since the data was last known-good (e.g. `GET /api/quizzes` isn't
unexpectedly empty, or the backend log at
`server/QuizBuilder.Api/Logs/quizbuilder-<date>.log` shows no recent
`TRUNCATE quizzes, quiz_attempts` / `POST /api/test/reset`). If a reset
already fired and no restore has happened since, restore first — don't back up
the wiped state.

## When to reach for this

- **Before running the e2e suite or the reset endpoint, if a snapshot already
  exists or the user has data worth keeping** → back up first, run the
  suite/reset, then restore right after — automatically, without being asked
  each time.
- **User says something like "бэкапь" / "снимай бэкап"** → run the backup
  script now, after the ordering sanity-check above.
- **No snapshot has been taken yet and the user hasn't asked for one** → don't
  restore (there's nothing to restore); mention that a snapshot would prevent
  data loss from the next e2e run if they want one.

## Keeping the table list current

`backup-dev-data.ps1` backs up an explicit table allow-list (not schema-driven).
Any migration that adds a new table reachable from `quizzes`/`quiz_attempts`
(e.g. a new question type's response/snapshot table) needs that table added to
the `$tables` array too, or its data silently won't be backed up or restored.
