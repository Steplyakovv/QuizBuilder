using MailKit;
using MailKit.Security;
using Microsoft.EntityFrameworkCore;
using MimeKit;
using QuizBuilder.Api.Data;
using QuizBuilder.Api.Dto;
using QuizBuilder.Api.Models;

namespace QuizBuilder.Api.Features.Attempts;

public record NotificationSendResult(bool Success, string? Error);

public interface IAttemptReportEmailSender
{
    Task SendAsync(Quiz quiz, QuizAttemptDto attempt, CancellationToken cancellationToken);
    Task<NotificationSendResult> SendTestEmailAsync(CancellationToken cancellationToken);
}

/// <summary>
/// Emails a graded report to the admin-configured recipient (NotificationSettings, editable
/// from the settings page - see Features/Settings) whenever an attempt is submitted, if both
/// a recipient and an SMTP host are configured (blank by default - the feature no-ops until
/// the admin fills them in). SendAsync's delivery failures (bad host, auth, timeout) are
/// caught and logged here, never propagated - same contract as AttemptWebhookSender: a broken
/// mail server must never fail a respondent's submission. SendTestEmailAsync is the opposite:
/// called directly from the settings page's "send test email" button, so it surfaces the real
/// error back to the admin instead of swallowing it.
/// </summary>
public class AttemptReportEmailSender(
    IMailTransport mailTransport,
    QuizBuilderDbContext db,
    ILogger<AttemptReportEmailSender> logger) : IAttemptReportEmailSender
{
    public async Task SendAsync(Quiz quiz, QuizAttemptDto attempt, CancellationToken cancellationToken)
    {
        var settings = await db.NotificationSettings.FirstOrDefaultAsync(cancellationToken);
        if (settings is null || string.IsNullOrWhiteSpace(settings.ReportRecipientEmail) || string.IsNullOrWhiteSpace(settings.SmtpHost))
        {
            return;
        }

        var message = new MimeMessage();
        message.From.Add(MailboxAddress.Parse(settings.SmtpFrom ?? settings.SmtpUsername ?? settings.ReportRecipientEmail));
        message.To.Add(MailboxAddress.Parse(settings.ReportRecipientEmail));
        message.Subject = $"Новое прохождение: {quiz.Title}";
        message.Body = new TextPart(MimeKit.Text.TextFormat.Html)
        {
            Text = AttemptReportEmailTemplate.Render(quiz, attempt),
        };

        try
        {
            await SendCoreAsync(settings, message, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Report email delivery failed for quiz {QuizId}", quiz.Id);
        }
    }

    public async Task<NotificationSendResult> SendTestEmailAsync(CancellationToken cancellationToken)
    {
        var settings = await db.NotificationSettings.FirstOrDefaultAsync(cancellationToken);
        if (settings is null || string.IsNullOrWhiteSpace(settings.ReportRecipientEmail) || string.IsNullOrWhiteSpace(settings.SmtpHost))
        {
            return new NotificationSendResult(false, "Заполните SMTP-хост и email получателя перед отправкой теста.");
        }

        var message = new MimeMessage();
        message.From.Add(MailboxAddress.Parse(settings.SmtpFrom ?? settings.SmtpUsername ?? settings.ReportRecipientEmail));
        message.To.Add(MailboxAddress.Parse(settings.ReportRecipientEmail));
        message.Subject = "Тестовое письмо от QuizBuilder";
        message.Body = new TextPart(MimeKit.Text.TextFormat.Html)
        {
            Text = "<p>Если вы видите это письмо — настройки SMTP в QuizBuilder работают правильно.</p>",
        };

        try
        {
            await SendCoreAsync(settings, message, cancellationToken);
            return new NotificationSendResult(true, null);
        }
        catch (Exception ex)
        {
            return new NotificationSendResult(false, ex.Message);
        }
    }

    private async Task SendCoreAsync(NotificationSettings settings, MimeMessage message, CancellationToken cancellationToken)
    {
        await mailTransport.ConnectAsync(
            settings.SmtpHost, settings.SmtpPort,
            settings.SmtpUseStartTls ? SecureSocketOptions.StartTls : SecureSocketOptions.Auto,
            cancellationToken);
        if (!string.IsNullOrEmpty(settings.SmtpUsername))
        {
            await mailTransport.AuthenticateAsync(settings.SmtpUsername, settings.SmtpPassword ?? "", cancellationToken);
        }
        await mailTransport.SendAsync(message, cancellationToken);
        await mailTransport.DisconnectAsync(true, cancellationToken);
    }
}
