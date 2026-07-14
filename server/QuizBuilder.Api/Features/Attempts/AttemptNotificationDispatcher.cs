using Microsoft.Extensions.DependencyInjection;
using QuizBuilder.Api.Dto;
using QuizBuilder.Api.Models;

namespace QuizBuilder.Api.Features.Attempts;

public interface IAttemptNotificationDispatcher
{
    void Dispatch(Quiz quiz, QuizAttempt attempt, QuizAttemptDto attemptDto);
}

/// <summary>
/// Runs webhook + report-email delivery off the request path, in a scope of its own, so a
/// slow or misconfigured SMTP server/webhook endpoint can never make a respondent wait for
/// their submission to complete. A new DI scope is required here (rather than reusing the
/// caller's) because the request's scope - and its DbContext, which AttemptReportEmailSender
/// depends on - is disposed as soon as SubmitAttemptCommandHandler returns.
/// </summary>
public class BackgroundAttemptNotificationDispatcher(
    IServiceScopeFactory scopeFactory,
    ILogger<BackgroundAttemptNotificationDispatcher> logger) : IAttemptNotificationDispatcher
{
    public void Dispatch(Quiz quiz, QuizAttempt attempt, QuizAttemptDto attemptDto)
    {
        _ = Task.Run(async () =>
        {
            using var scope = scopeFactory.CreateScope();
            var webhookSender = scope.ServiceProvider.GetRequiredService<IAttemptWebhookSender>();
            var reportEmailSender = scope.ServiceProvider.GetRequiredService<IAttemptReportEmailSender>();
            try
            {
                await Task.WhenAll(
                    webhookSender.NotifyAsync(quiz, attempt, CancellationToken.None),
                    reportEmailSender.SendAsync(quiz, attemptDto, CancellationToken.None));
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Post-submission notification dispatch failed for quiz {QuizId}", quiz.Id);
            }
        });
    }
}
