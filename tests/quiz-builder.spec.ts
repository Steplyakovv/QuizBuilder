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
  await page.getByRole('button', { name: 'Сохранить' }).click();

  await page.getByRole('link', { name: '← К списку опросников' }).click();
  await expect(page.getByRole('link', { name: 'Опрос про чай' })).toBeVisible();
});

test('quiz edits are not persisted until Save is pressed', async ({ page }) => {
  await page.getByLabel('Название нового опросника').fill('Опрос про кофе');
  await page.getByRole('button', { name: 'Создать' }).click();
  await page.getByRole('link', { name: 'Опрос про кофе' }).click();

  const titleField = page.getByLabel('Название опросника');
  const saveButton = page.getByRole('button', { name: 'Сохранить' });
  await expect(saveButton).toBeDisabled();

  await titleField.fill('Опрос про чай');
  await titleField.blur();
  await expect(saveButton).toBeEnabled();

  await page.getByRole('link', { name: '← К списку опросников' }).click();
  await expect(page.getByRole('link', { name: 'Опрос про кофе' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Опрос про чай' })).toHaveCount(0);

  await page.getByRole('link', { name: 'Опрос про кофе' }).click();
  await page.getByLabel('Название опросника').fill('Опрос про чай');
  await page.getByLabel('Название опросника').blur();
  await page.getByRole('button', { name: 'Сохранить' }).click();

  await page.getByRole('link', { name: '← К списку опросников' }).click();
  await expect(page.getByRole('link', { name: 'Опрос про чай' })).toBeVisible();
});

test('adds options to a single-choice question and marks a correct answer in graded mode', async ({
  page,
}) => {
  await page.getByLabel('Название нового опросника').fill('Опрос про кофе');
  await page.getByRole('button', { name: 'Создать' }).click();
  await page.getByRole('link', { name: 'Опрос про кофе' }).click();

  await page.getByRole('button', { name: 'Добавить вопрос' }).click();

  const questionItem = page.locator('.question-item').first();
  await questionItem.getByRole('button', { name: 'Добавить вариант' }).click();
  await questionItem.getByRole('button', { name: 'Добавить вариант' }).click();

  const optionInputs = questionItem.locator('.option-row input');
  await optionInputs.nth(0).fill('Латте');
  await optionInputs.nth(0).blur();
  await optionInputs.nth(1).fill('Эспрессо');
  await optionInputs.nth(1).blur();

  await expect(questionItem.getByRole('button', { name: /Отметить как правильный/ })).toHaveCount(
    0,
  );

  await page.getByRole('checkbox', { name: 'Квиз с баллами' }).click();

  await questionItem.getByRole('button', { name: 'Отметить как правильный' }).first().click();
  await expect(questionItem.getByRole('button', { name: 'Правильный ответ' })).toBeVisible();
});

test('configures a text question as multiline with a max length', async ({ page }) => {
  await page.getByLabel('Название нового опросника').fill('Опрос про кофе');
  await page.getByRole('button', { name: 'Создать' }).click();
  await page.getByRole('link', { name: 'Опрос про кофе' }).click();

  await page.getByLabel('Тип вопроса').click();
  await page.getByRole('option', { name: 'Текстовый ответ' }).click();
  await page.getByRole('button', { name: 'Добавить вопрос' }).click();

  const questionItem = page.locator('.question-item').first();
  await questionItem.getByRole('checkbox', { name: 'Многострочный ответ' }).click();
  const maxLengthField = questionItem.getByLabel('Максимум символов');
  await maxLengthField.fill('200');
  await maxLengthField.blur();

  await expect(questionItem.getByRole('checkbox', { name: 'Многострочный ответ' })).toBeChecked();
  await expect(maxLengthField).toHaveValue('200');
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
