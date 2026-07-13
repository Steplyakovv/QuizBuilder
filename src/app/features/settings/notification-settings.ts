import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NotificationSettings } from '../../core/models/settings.models';
import { SETTINGS_REPOSITORY } from '../../core/repositories/settings-repository';

@Component({
  selector: 'app-notification-settings',
  imports: [RouterLink, MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatInputModule],
  templateUrl: './notification-settings.html',
  styleUrl: './notification-settings.scss',
})
export class NotificationSettingsPage {
  private readonly repository = inject(SETTINGS_REPOSITORY);

  readonly settings = signal<NotificationSettings | null>(null);
  readonly saving = signal(false);
  readonly saveMessage = signal<string | null>(null);
  readonly sendingTestEmail = signal(false);
  readonly testEmailResult = signal<{ success: boolean; message: string } | null>(null);

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.settings.set(await this.repository.getNotificationSettings());
  }

  private update(patch: Partial<NotificationSettings>): void {
    const current = this.settings();
    if (!current) {
      return;
    }
    this.settings.set({ ...current, ...patch });
  }

  updateHost(value: string): void {
    this.update({ host: value.trim() || undefined });
  }

  updatePort(rawValue: string): void {
    const port = Number(rawValue);
    if (rawValue.trim() && !Number.isNaN(port)) {
      this.update({ port });
    }
  }

  updateUsername(value: string): void {
    this.update({ username: value.trim() || undefined });
  }

  updatePassword(value: string): void {
    this.update({ password: value });
  }

  updateFrom(value: string): void {
    this.update({ from: value.trim() || undefined });
  }

  updateUseStartTls(useStartTls: boolean): void {
    this.update({ useStartTls });
  }

  updateReportRecipientEmail(value: string): void {
    this.update({ reportRecipientEmail: value.trim() || undefined });
  }

  async save(): Promise<void> {
    const current = this.settings();
    if (!current) {
      return;
    }
    this.saving.set(true);
    this.saveMessage.set(null);
    try {
      await this.repository.saveNotificationSettings(current);
      this.saveMessage.set('Сохранено.');
      await this.load();
    } finally {
      this.saving.set(false);
    }
  }

  async sendTestEmail(): Promise<void> {
    this.sendingTestEmail.set(true);
    this.testEmailResult.set(null);
    try {
      const result = await this.repository.sendTestEmail();
      this.testEmailResult.set({
        success: result.success,
        message: result.success ? 'Тестовое письмо отправлено.' : (result.error ?? 'Не удалось отправить письмо.'),
      });
    } finally {
      this.sendingTestEmail.set(false);
    }
  }
}
