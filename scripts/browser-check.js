// Reusable Playwright driver for manual "act like a real user" checks
// against the running dev server (npm start must already be up).
//
// Usage: npm run browser-check -- path/to/scenario.js
// The scenario file must export: module.exports = async (page) => { ... };
// Write scenario files as scratch files (not committed) — this script is
// the only permanent, reusable part of the pattern.

const path = require('path');
const { chromium } = require('playwright-core');

async function run(scenarioPath) {
  const scenario = require(path.resolve(scenarioPath));
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('pageerror', (err) => console.log('PAGEERROR:', err.message));

  await page.goto('http://localhost:4200/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  try {
    await scenario(page);
  } finally {
    await browser.close();
  }
}

const scenarioPath = process.argv[2];
if (!scenarioPath) {
  console.error('Usage: npm run browser-check -- <scenario-file.js>');
  process.exit(1);
}

run(scenarioPath).catch((err) => {
  console.error(err);
  process.exit(1);
});
