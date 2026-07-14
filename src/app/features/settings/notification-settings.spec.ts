import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SETTINGS_REPOSITORY } from '../../core/repositories/settings-repository';
import { FakeSettingsRepository } from '../../core/testing/fake-settings-repository';
import { provideTestTransloco } from '../../core/testing/provide-test-transloco';
import { NotificationSettingsPage } from './notification-settings';

describe('NotificationSettingsPage', () => {
  async function createComponent(repository = new FakeSettingsRepository()) {
    await TestBed.configureTestingModule({
      imports: [NotificationSettingsPage],
      providers: [
        provideRouter([]),
        provideTestTransloco(),
        { provide: SETTINGS_REPOSITORY, useValue: repository },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(NotificationSettingsPage);
    await fixture.whenStable();
    return { fixture, repository };
  }

  it('loads the current settings on init', async () => {
    const repository = new FakeSettingsRepository();
    repository.settings = {
      host: 'smtp.example.com',
      port: 465,
      username: 'user',
      hasPassword: true,
      useStartTls: false,
      reportRecipientEmail: 'admin@example.com',
    };
    const { fixture } = await createComponent(repository);

    expect(fixture.componentInstance.settings()).toEqual(repository.settings);
  });

  it('saves the edited fields and shows a confirmation', async () => {
    const { fixture, repository } = await createComponent();

    fixture.componentInstance.updateHost('smtp.example.com');
    fixture.componentInstance.updateReportRecipientEmail('admin@example.com');
    await fixture.componentInstance.save();

    expect(repository.settings.host).toBe('smtp.example.com');
    expect(repository.settings.reportRecipientEmail).toBe('admin@example.com');
    expect(fixture.componentInstance.saveMessage()).toBe('Сохранено.');
  });

  it('preserves hasPassword when saving with a blank password field', async () => {
    const repository = new FakeSettingsRepository();
    repository.settings = { port: 587, hasPassword: true, useStartTls: true };
    const { fixture } = await createComponent(repository);

    fixture.componentInstance.updateReportRecipientEmail('admin@example.com');
    await fixture.componentInstance.save();

    expect(fixture.componentInstance.settings()?.hasPassword).toBe(true);
  });

  it('shows a success message when the test email succeeds', async () => {
    const repository = new FakeSettingsRepository();
    repository.testEmailResult = { success: true };
    const { fixture } = await createComponent(repository);

    await fixture.componentInstance.sendTestEmail();

    expect(fixture.componentInstance.testEmailResult()).toEqual({
      success: true,
      message: 'Тестовое письмо отправлено.',
    });
  });

  it('shows the real error message when the test email fails', async () => {
    const repository = new FakeSettingsRepository();
    repository.testEmailResult = {
      success: false,
      error: '535: 5.7.8 Incorrect authentication data',
    };
    const { fixture } = await createComponent(repository);

    await fixture.componentInstance.sendTestEmail();

    expect(fixture.componentInstance.testEmailResult()).toEqual({
      success: false,
      message: '535: 5.7.8 Incorrect authentication data',
    });
  });
});
