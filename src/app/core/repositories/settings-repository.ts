import { InjectionToken } from '@angular/core';
import { NotificationSettings, TestEmailResult } from '../models/settings.models';

export interface SettingsRepository {
  getNotificationSettings(): Promise<NotificationSettings>;
  saveNotificationSettings(settings: NotificationSettings): Promise<void>;
  sendTestEmail(): Promise<TestEmailResult>;
}

export const SETTINGS_REPOSITORY = new InjectionToken<SettingsRepository>('SETTINGS_REPOSITORY');
