using System.Net;
using System.Text.Json;
using Microsoft.Extensions.Logging.Abstractions;
using QuizBuilder.Api.Features.Attempts;
using QuizBuilder.Api.Models;

namespace QuizBuilder.Api.Tests.Features.Attempts;

public class AttemptWebhookSenderTests
{
    private class FakeHttpMessageHandler(HttpStatusCode statusCode, Exception? throwOnSend = null) : HttpMessageHandler
    {
        public HttpRequestMessage? LastRequest { get; private set; }
        public string? LastRequestBody { get; private set; }

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            LastRequest = request;
            LastRequestBody = request.Content is null ? null : await request.Content.ReadAsStringAsync(cancellationToken);
            if (throwOnSend is not null)
            {
                throw throwOnSend;
            }
            return new HttpResponseMessage(statusCode);
        }
    }

    private static Quiz CreateQuiz(string? webhookUrl) => new()
    {
        Id = Guid.NewGuid(),
        Title = "Real quiz",
        IsGraded = true,
        WebhookUrl = webhookUrl,
    };

    private static QuizAttempt CreateAttempt() => new()
    {
        Id = Guid.NewGuid(),
        RespondentName = "Alice",
        Score = 80,
        StartedAt = DateTimeOffset.UtcNow,
        CompletedAt = DateTimeOffset.UtcNow,
    };

    [Fact]
    public async Task Does_not_send_a_request_when_no_webhook_url_is_set()
    {
        var fakeHandler = new FakeHttpMessageHandler(HttpStatusCode.OK);
        var sender = new AttemptWebhookSender(new HttpClient(fakeHandler), NullLogger<AttemptWebhookSender>.Instance);

        await sender.NotifyAsync(CreateQuiz(null), CreateAttempt(), CancellationToken.None);

        Assert.Null(fakeHandler.LastRequest);
    }

    [Fact]
    public async Task Posts_the_expected_payload_to_the_configured_url()
    {
        var fakeHandler = new FakeHttpMessageHandler(HttpStatusCode.OK);
        var sender = new AttemptWebhookSender(new HttpClient(fakeHandler), NullLogger<AttemptWebhookSender>.Instance);
        var quiz = CreateQuiz("https://example.com/hook");
        var attempt = CreateAttempt();

        await sender.NotifyAsync(quiz, attempt, CancellationToken.None);

        Assert.NotNull(fakeHandler.LastRequest);
        Assert.Equal(HttpMethod.Post, fakeHandler.LastRequest!.Method);
        Assert.Equal(quiz.WebhookUrl, fakeHandler.LastRequest.RequestUri!.ToString());

        using var body = JsonDocument.Parse(fakeHandler.LastRequestBody!);
        var root = body.RootElement;
        Assert.Equal("quiz.attempt.submitted", root.GetProperty("event").GetString());
        Assert.Equal(quiz.Id.ToString(), root.GetProperty("quizId").GetString());
        Assert.Equal(quiz.Title, root.GetProperty("quizTitle").GetString());
        Assert.Equal(attempt.Id.ToString(), root.GetProperty("attemptId").GetString());
        Assert.Equal(attempt.RespondentName, root.GetProperty("respondentName").GetString());
        Assert.True(root.GetProperty("isGraded").GetBoolean());
        Assert.Equal(attempt.Score, root.GetProperty("score").GetInt32());
    }

    [Fact]
    public async Task Does_not_throw_when_the_webhook_target_returns_a_non_success_status()
    {
        var fakeHandler = new FakeHttpMessageHandler(HttpStatusCode.InternalServerError);
        var sender = new AttemptWebhookSender(new HttpClient(fakeHandler), NullLogger<AttemptWebhookSender>.Instance);

        await sender.NotifyAsync(CreateQuiz("https://example.com/hook"), CreateAttempt(), CancellationToken.None);
    }

    [Fact]
    public async Task Does_not_throw_when_the_request_itself_fails()
    {
        var fakeHandler = new FakeHttpMessageHandler(HttpStatusCode.OK, throwOnSend: new HttpRequestException("boom"));
        var sender = new AttemptWebhookSender(new HttpClient(fakeHandler), NullLogger<AttemptWebhookSender>.Instance);

        await sender.NotifyAsync(CreateQuiz("https://example.com/hook"), CreateAttempt(), CancellationToken.None);
    }
}
