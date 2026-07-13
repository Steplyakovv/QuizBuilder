import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../config/api-url';
import { NotificationSettings, TestEmailResult } from '../models/settings.models';
import { SettingsRepository } from './settings-repository';

@Injectable({ providedIn: 'root' })
export class HttpSettingsRepository implements SettingsRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/settings`;

  async getNotificationSettings(): Promise<NotificationSettings> {
    return firstValueFrom(
      this.http.get<NotificationSettings>(`${this.baseUrl}/notifications`, {
        withCredentials: true,
      }),
    );
  }

  async saveNotificationSettings(settings: NotificationSettings): Promise<void> {
    await firstValueFrom(
      this.http.put<void>(`${this.baseUrl}/notifications`, settings, { withCredentials: true }),
    );
  }

  async sendTestEmail(): Promise<TestEmailResult> {
    return firstValueFrom(
      this.http.post<TestEmailResult>(
        `${this.baseUrl}/notifications/test-email`,
        {},
        { withCredentials: true },
      ),
    );
  }
}
