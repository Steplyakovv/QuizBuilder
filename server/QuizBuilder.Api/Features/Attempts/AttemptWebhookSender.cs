using System.Net.Http.Json;
using System.Text.Json;
using QuizBuilder.Api.Models;

namespace QuizBuilder.Api.Features.Attempts;

public interface IAttemptWebhookSender
{
    Task NotifyAsync(Quiz quiz, QuizAttempt attempt, CancellationToken cancellationToken);
}

public record AttemptWebhookPayload(
    string Event,
    string QuizId,
    string QuizTitle,
    string AttemptId,
    string? RespondentName,
    bool IsGraded,
    int? Score,
    DateTimeOffset StartedAt,
    DateTimeOffset? CompletedAt);

/// <summary>
/// POSTs a JSON payload to Quiz.WebhookUrl (if set) so the admin can wire it up to
/// Zapier/Make/n8n/a Slack Incoming Webhook/etc on their own end. Delivery failures
/// (bad URL, DNS, timeout, non-2xx) are caught and logged here, never propagated -
/// a broken/slow webhook must never fail the respondent's submission.
/// </summary>
public class AttemptWebhookSender(HttpClient httpClient, ILogger<AttemptWebhookSender> logger) : IAttemptWebhookSender
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public async Task NotifyAsync(Quiz quiz, QuizAttempt attempt, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(quiz.WebhookUrl))
        {
            return;
        }

        var payload = new AttemptWebhookPayload(
            "quiz.attempt.submitted",
            quiz.Id.ToString(),
            quiz.Title,
            attempt.Id.ToString(),
            attempt.RespondentName,
            quiz.IsGraded,
            attempt.Score,
            attempt.StartedAt,
            attempt.CompletedAt);

        try
        {
            var response = await httpClient.PostAsJsonAsync(quiz.WebhookUrl, payload, JsonOptions, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning("Webhook for quiz {QuizId} returned {StatusCode}", quiz.Id, response.StatusCode);
            }
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Webhook delivery failed for quiz {QuizId}", quiz.Id);
        }
    }
}
