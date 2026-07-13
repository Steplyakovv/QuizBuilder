using MailKit;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using QuizBuilder.Api.Dto;
using QuizBuilder.Api.Models;

namespace QuizBuilder.Api.Features.Attempts;

public interface IAttemptReportEmailSender
{
    Task SendAsync(Quiz quiz, QuizAttemptDto attempt, CancellationToken cancellationToken);
}

public class SmtpOptions
{
    public string? Host { get; set; }
    public int Port { get; set; } = 587;
    public string? Username { get; set; }
    public string? Password { get; set; }
    public string? From { get; set; }
    public bool UseStartTls { get; set; } = true;
}

public class NotificationOptions
{
    public string? ReportRecipientEmail { get; set; }
}

/// <summary>
/// Emails a graded report to Notifications:ReportRecipientEmail whenever an attempt is
/// submitted, if both that and Smtp:Host are configured (both blank by default - the feature
/// no-ops until the admin fills in real SMTP credentials). Delivery failures (bad host, auth,
/// timeout) are caught and logged here, never propagated - same contract as
/// AttemptWebhookSender: a broken mail server must never fail a respondent's submission.
/// </summary>
public class AttemptReportEmailSender(
    IMailTransport mailTransport,
    IOptions<SmtpOptions> smtpOptions,
    IOptions<NotificationOptions> notificationOptions,
    ILogger<AttemptReportEmailSender> logger) : IAttemptReportEmailSender
{
    public async Task SendAsync(Quiz quiz, QuizAttemptDto attempt, CancellationToken cancellationToken)
    {
        var smtp = smtpOptions.Value;
        var recipient = notificationOptions.Value.ReportRecipientEmail;
        if (string.IsNullOrWhiteSpace(recipient) || string.IsNullOrWhiteSpace(smtp.Host))
        {
            return;
        }

        try
        {
            var message = new MimeMessage();
            message.From.Add(MailboxAddress.Parse(smtp.From ?? smtp.Username ?? recipient));
            message.To.Add(MailboxAddress.Parse(recipient));
            message.Subject = $"Новое прохождение: {quiz.Title}";
            message.Body = new TextPart(MimeKit.Text.TextFormat.Html)
            {
                Text = AttemptReportEmailTemplate.Render(quiz, attempt),
            };

            await mailTransport.ConnectAsync(
                smtp.Host, smtp.Port, smtp.UseStartTls ? SecureSocketOptions.StartTls : SecureSocketOptions.Auto, cancellationToken);
            if (!string.IsNullOrEmpty(smtp.Username))
            {
                await mailTransport.AuthenticateAsync(smtp.Username, smtp.Password ?? "", cancellationToken);
            }
            await mailTransport.SendAsync(message, cancellationToken);
            await mailTransport.DisconnectAsync(true, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Report email delivery failed for quiz {QuizId}", quiz.Id);
        }
    }
}
