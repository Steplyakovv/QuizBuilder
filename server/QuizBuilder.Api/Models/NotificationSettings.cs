namespace QuizBuilder.Api.Models;

/// <summary>
/// Single-row table (seeded once, see DbInitializer) holding the SMTP/report-recipient
/// config for AttemptReportEmailSender. Editable from the admin settings page instead of
/// appsettings/user-secrets. SmtpPassword is plaintext, same precedent as Quiz.AccessPassword -
/// not worth encryption-at-rest machinery for a single-admin personal tool.
/// </summary>
public class NotificationSettings
{
    public Guid Id { get; set; }
    public string? SmtpHost { get; set; }
    public int SmtpPort { get; set; } = 587;
    public string? SmtpUsername { get; set; }
    public string? SmtpPassword { get; set; }
    public string? SmtpFrom { get; set; }
    public bool SmtpUseStartTls { get; set; } = true;
    public string? ReportRecipientEmail { get; set; }
}
