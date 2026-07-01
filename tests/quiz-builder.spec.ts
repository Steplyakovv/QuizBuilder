import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('creates a quiz and opens the editor', async ({ page }) => {
  await page.getByLabel('Название нового опросника').fill('Опрос про кофе');
  await page.getByRole('button', { name: 'Создать' }).click();

  await expect(page.getByRole('link', { name: 'Опрос про кофе' })).toBeVisible();

  await page.getByRole('link', { name: 'Опрос про кофе' }).click();
  await expect(page.getByLabel('Название опросника')).toHaveValue('Опрос про кофе');
});

test('adds a question and renames the quiz from the editor', async ({ page }) => {
  await page.getByLabel('Название нового опросника').fill('Опрос про кофе');
  await page.getByRole('button', { name: 'Создать' }).click();
  await page.getByRole('link', { name: 'Опрос про кофе' }).click();

  await page.getByRole('button', { name: 'Добавить вопрос' }).click();
  await expect(page.locator('.question-item')).toHaveCount(1);

  const titleField = page.getByLabel('Название опросника');
  await titleField.fill('Опрос про чай');
  await titleField.blur();

  await page.getByRole('link', { name: '← К списку опросников' }).click();
  await expect(page.getByRole('link', { name: 'Опрос про чай' })).toBeVisible();
});

test('duplicates and deletes a quiz from the list', async ({ page }) => {
  await page.getByLabel('Название нового опросника').fill('Опрос про кофе');
  await page.getByRole('button', { name: 'Создать' }).click();

  await page.getByRole('button', { name: 'Дублировать' }).click();
  await expect(page.locator('.quiz-card')).toHaveCount(2);

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Удалить' }).first().click();
  await expect(page.locator('.quiz-card')).toHaveCount(1);
});
