import { NotificationSettings, TestEmailResult } from '../models/settings.models';
import { SettingsRepository } from '../repositories/settings-repository';

export class FakeSettingsRepository implements SettingsRepository {
  settings: NotificationSettings = { port: 587, hasPassword: false, useStartTls: true };
  testEmailResult: TestEmailResult = { success: true };

  async getNotificationSettings(): Promise<NotificationSettings> {
    return this.settings;
  }

  async saveNotificationSettings(settings: NotificationSettings): Promise<void> {
    const hasPassword = !!settings.password || this.settings.hasPassword;
    this.settings = { ...settings, password: undefined, hasPassword };
  }

  async sendTestEmail(): Promise<TestEmailResult> {
    return this.testEmailResult;
  }
}
