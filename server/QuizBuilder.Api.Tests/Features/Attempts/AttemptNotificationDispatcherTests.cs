using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using QuizBuilder.Api.Dto;
using QuizBuilder.Api.Features.Attempts;
using QuizBuilder.Api.Models;

namespace QuizBuilder.Api.Tests.Features.Attempts;

public class AttemptNotificationDispatcherTests
{
    private class SignalingWebhookSender : IAttemptWebhookSender
    {
        public readonly TaskCompletionSource<(Quiz Quiz, QuizAttempt Attempt)> Called = new();

        public Task NotifyAsync(Quiz quiz, QuizAttempt attempt, CancellationToken cancellationToken)
        {
            Called.TrySetResult((quiz, attempt));
            return Task.CompletedTask;
        }
    }

    private class SignalingReportEmailSender : IAttemptReportEmailSender
    {
        public readonly TaskCompletionSource<(Quiz Quiz, QuizAttemptDto Attempt)> Called = new();
        public Exception? ThrowOnSend;

        public Task SendAsync(Quiz quiz, QuizAttemptDto attempt, CancellationToken cancellationToken)
        {
            Called.TrySetResult((quiz, attempt));
            return ThrowOnSend is null ? Task.CompletedTask : throw ThrowOnSend;
        }

        public Task<NotificationSendResult> SendTestEmailAsync(CancellationToken cancellationToken) =>
            Task.FromResult(new NotificationSendResult(true, null));
    }

    private static (BackgroundAttemptNotificationDispatcher Dispatcher, SignalingWebhookSender Webhook, SignalingReportEmailSender Email)
        CreateDispatcher()
    {
        var webhook = new SignalingWebhookSender();
        var email = new SignalingReportEmailSender();
        var provider = new ServiceCollection()
            .AddSingleton<IAttemptWebhookSender>(webhook)
            .AddSingleton<IAttemptReportEmailSender>(email)
            .BuildServiceProvider();
        var dispatcher = new BackgroundAttemptNotificationDispatcher(
            provider.GetRequiredService<IServiceScopeFactory>(),
            NullLogger<BackgroundAttemptNotificationDispatcher>.Instance);
        return (dispatcher, webhook, email);
    }

    private static (Quiz Quiz, QuizAttempt Attempt, QuizAttemptDto Dto) CreateFixture()
    {
        var quiz = new Quiz { Id = Guid.NewGuid(), Title = "Real quiz" };
        var attempt = new QuizAttempt { Id = Guid.NewGuid(), QuizId = quiz.Id };
        var dto = new QuizAttemptDto
        {
            Id = attempt.Id.ToString(),
            QuizId = quiz.Id.ToString(),
            StartedAt = DateTimeOffset.UtcNow.ToString("o"),
            Responses = [],
        };
        return (quiz, attempt, dto);
    }

    [Fact]
    public async Task Dispatches_to_both_senders_without_the_caller_awaiting_completion()
    {
        var (dispatcher, webhook, email) = CreateDispatcher();
        var (quiz, attempt, dto) = CreateFixture();

        dispatcher.Dispatch(quiz, attempt, dto);

        var (webhookQuiz, webhookAttempt) = await webhook.Called.Task.WaitAsync(TimeSpan.FromSeconds(2));
        Assert.Equal(quiz.Id, webhookQuiz.Id);
        Assert.Equal(attempt.Id, webhookAttempt.Id);

        var (emailQuiz, emailDto) = await email.Called.Task.WaitAsync(TimeSpan.FromSeconds(2));
        Assert.Equal(quiz.Id, emailQuiz.Id);
        Assert.Equal(dto.Id, emailDto.Id);
    }

    [Fact]
    public async Task Does_not_throw_when_a_sender_fails()
    {
        var (dispatcher, webhook, email) = CreateDispatcher();
        email.ThrowOnSend = new InvalidOperationException("boom");
        var (quiz, attempt, dto) = CreateFixture();

        dispatcher.Dispatch(quiz, attempt, dto);

        await webhook.Called.Task.WaitAsync(TimeSpan.FromSeconds(2));
        await email.Called.Task.WaitAsync(TimeSpan.FromSeconds(2));
    }
}
