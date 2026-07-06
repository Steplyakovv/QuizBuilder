---
description: Manually verify a QuizBuilder UI change or bug repro by driving a real headless Chromium browser through Playwright, the same way a user would click through the app. Use this instead of writing a throwaway Playwright script from scratch.
---

# Browser check

QuizBuilder has no backend and no auth, so the fastest way to confirm a UI
change actually works — not just that unit tests pass — is to drive a real
browser against the running dev server and read back what a user would see.

## Prerequisites

The dev server must already be running: `npm start` (http://localhost:4200).

## Usage

1. Write a scenario file (put it in the session scratchpad, not in the repo —
   it's throwaway, like a manual test session):

   ```js
   // scenario.js
   module.exports = async (page) => {
     await page.getByLabel('Название нового опросника').fill('Мой опрос');
     await page.getByRole('button', { name: 'Создать' }).click();
     await page.getByRole('link', { name: 'Мой опрос' }).click();
     console.log('title:', await page.getByLabel('Название опросника').inputValue());
   };
   ```

2. Run it:

   ```
   npm run browser-check -- /path/to/scenario.js
   ```

`scripts/browser-check.js` (checked into the repo) launches Chromium via
`playwright-core`, opens the app, clears `localStorage`, reloads, runs your
scenario against the page, then closes the browser. Your scenario just
contains the user actions and whatever `console.log` output you want to
inspect (values, visibility, ARIA labels, `page.locator(...).screenshot()`
if you need to eyeball layout).

## When to reach for this vs. the real e2e suite

- **Reproducing a bug report or checking a fix before/without committing a
  permanent test** → this. Delete the scenario file when done.
- **A user-facing scenario worth protecting against regressions forever** →
  add it to [tests/quiz-builder.spec.ts](../../../tests/quiz-builder.spec.ts)
  instead (`npm run test:e2e`), so it runs on every `npm run verify`.
