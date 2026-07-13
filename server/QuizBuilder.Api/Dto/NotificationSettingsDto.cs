namespace QuizBuilder.Api.Dto;

/// <summary>
/// The raw password is never returned by GET (only HasPassword). On PUT, Password is
/// optional - blank/omitted means "keep the existing stored password unchanged".
/// </summary>
public record NotificationSettingsDto
{
    public string? Host { get; init; }
    public int Port { get; init; } = 587;
    public string? Username { get; init; }
    public string? Password { get; init; }
    public bool HasPassword { get; init; }
    public string? From { get; init; }
    public bool UseStartTls { get; init; } = true;
    public string? ReportRecipientEmail { get; init; }
}
