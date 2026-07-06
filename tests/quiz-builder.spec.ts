import { expect, test, type Page } from '@playwright/test';

async function loginAsAdmin(page: Page): Promise<void> {
  await page.getByRole('link', { name: 'Войти как администратор' }).click();
  await page.getByLabel('Логин').fill('admin');
  await page.getByLabel('Пароль').fill('admin');
  await page.getByRole('button', { name: 'Войти' }).click();
}

test.describe('as admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await loginAsAdmin(page);
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

    await expect(
      questionItem.getByRole('button', { name: /Отметить как правильный/ }),
    ).toHaveCount(0);

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

    await expect(
      questionItem.getByRole('checkbox', { name: 'Многострочный ответ' }),
    ).toBeChecked();
    await expect(maxLengthField).toHaveValue('200');
  });

  test('respondent must answer a required question before results are graded', async ({ page }) => {
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

    await page.getByRole('checkbox', { name: 'Квиз с баллами' }).click();
    await questionItem.getByRole('button', { name: 'Отметить как правильный' }).first().click();
    await page.getByRole('button', { name: 'Сохранить' }).click();

    await page.getByRole('link', { name: '← К списку опросников' }).click();
    await page.getByRole('link', { name: 'Пройти опросник' }).click();

    await page.getByRole('button', { name: 'Отправить ответы' }).click();
    await expect(page.getByText('Это поле обязательно для заполнения')).toBeVisible();

    await page.getByRole('radio', { name: 'Латте' }).click();
    await page.getByRole('button', { name: 'Отправить ответы' }).click();

    await expect(page.getByText('Спасибо! Ваши ответы сохранены.')).toBeVisible();
    await expect(page.getByText('Результат: 1 из 1 правильных ответов')).toBeVisible();
  });

  test('sees a graded attempt with the respondent name and answers on the results page', async ({
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
    await page.getByRole('checkbox', { name: 'Квиз с баллами' }).click();
    await questionItem.getByRole('button', { name: 'Отметить как правильный' }).first().click();
    await page.getByRole('button', { name: 'Сохранить' }).click();
    await page.getByRole('link', { name: '← К списку опросников' }).click();

    await page.getByRole('link', { name: 'Пройти опросник' }).click();
    await page.getByLabel('Ваше имя (необязательно)').fill('Иван');
    await page.getByRole('radio', { name: 'Латте' }).click();
    await page.getByRole('button', { name: 'Отправить ответы' }).click();
    await page.getByRole('link', { name: '← К списку опросников' }).click();

    await page.getByRole('link', { name: 'Результаты' }).click();
    await expect(page.locator('.attempts-table tbody tr')).toHaveCount(1);
    await expect(page.getByRole('cell', { name: 'Иван' })).toBeVisible();
    await expect(page.getByRole('cell', { name: '1 из 1' })).toBeVisible();
    await expect(page.getByText('1 из 1 верно')).toBeVisible();

    await page.getByRole('button', { name: 'Ответы' }).click();
    await expect(page.locator('.attempt-detail')).toContainText('Латте');
  });

  test('previews a quiz from the editor without saving an attempt', async ({ page }) => {
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

    await page.getByRole('button', { name: 'Предпросмотр' }).click();
    await expect(page.getByText('Это предпросмотр — ответы не сохраняются.')).toBeVisible();

    await page.getByRole('radio', { name: 'Латте' }).click();
    await page.getByRole('button', { name: 'Отправить ответы' }).click();
    await expect(page.getByText('Это предпросмотр — ответы не сохранены.')).toBeVisible();

    await page.getByRole('button', { name: 'Закрыть предпросмотр' }).click();
    await expect(page.locator('app-quiz-runner')).toHaveCount(0);

    await page.getByRole('link', { name: '← К списку опросников' }).click();
    await page.getByRole('link', { name: 'Результаты' }).click();
    await expect(page.getByText('Пока никто не прошёл этот опросник.')).toBeVisible();
  });

  test('exports a quiz to JSON and imports it back as a new quiz', async ({ page }) => {
    await page.getByLabel('Название нового опросника').fill('Опрос про кофе');
    await page.getByRole('button', { name: 'Создать' }).click();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Экспортировать в JSON' }).click();
    const download = await downloadPromise;
    const filePath = await download.path();

    await page.locator('input[type="file"]').setInputFiles(filePath!);

    await expect(page.locator('.quiz-card')).toHaveCount(2);
    await expect(page.getByRole('link', { name: 'Опрос про кофе' })).toHaveCount(2);
  });

  test('shows an error when importing a file that is not a valid quiz', async ({ page }) => {
    await page.locator('input[type="file"]').setInputFiles({
      name: 'invalid.json',
      mimeType: 'application/json',
      buffer: Buffer.from('not a quiz'),
    });

    await expect(page.getByText('Файл повреждён или не является корректным JSON.')).toBeVisible();
    await expect(page.locator('.quiz-card')).toHaveCount(0);
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
});

test.describe('authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('logs in as admin and back out to the respondent view', async ({ page }) => {
    await expect(page.getByLabel('Название нового опросника')).toHaveCount(0);

    await loginAsAdmin(page);
    await expect(page.getByLabel('Название нового опросника')).toBeVisible();

    await page.getByRole('button', { name: 'Выйти' }).click();
    await expect(page.getByLabel('Название нового опросника')).toHaveCount(0);
  });

  test('rejects incorrect credentials', async ({ page }) => {
    await page.getByRole('link', { name: 'Войти как администратор' }).click();
    await page.getByLabel('Логин').fill('admin');
    await page.getByLabel('Пароль').fill('wrong');
    await page.getByRole('button', { name: 'Войти' }).click();

    await expect(page.getByText('Неверный логин или пароль.')).toBeVisible();
  });

  test('a non-admin only sees quizzes to take, without management controls', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByLabel('Название нового опросника').fill('Опрос про кофе');
    await page.getByRole('button', { name: 'Создать' }).click();
    await page.getByRole('button', { name: 'Выйти' }).click();

    await expect(page.getByLabel('Название нового опросника')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Удалить' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Опрос про кофе' })).toHaveCount(0);
    await expect(page.getByText('Опрос про кофе')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Пройти опросник' })).toBeVisible();
  });

  test('direct navigation to the editor redirects a non-admin to the quiz list', async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByLabel('Название нового опросника').fill('Опрос про кофе');
    await page.getByRole('button', { name: 'Создать' }).click();
    const editHref = await page.getByRole('link', { name: 'Опрос про кофе' }).getAttribute('href');
    await page.getByRole('button', { name: 'Выйти' }).click();

    await page.goto(editHref!);
    await expect(page).toHaveURL('/');
  });
});
