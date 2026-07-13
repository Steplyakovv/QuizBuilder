export interface NotificationSettings {
  host?: string;
  port: number;
  username?: string;
  /** Only sent on save; blank means "keep the existing stored password". Never returned by GET. */
  password?: string;
  hasPassword: boolean;
  from?: string;
  useStartTls: boolean;
  reportRecipientEmail?: string;
}

export interface TestEmailResult {
  success: boolean;
  error?: string;
}
