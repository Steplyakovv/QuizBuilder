using Microsoft.EntityFrameworkCore;
using NSubstitute;
using QuizBuilder.Api.Data;
using QuizBuilder.Api.Dto;
using QuizBuilder.Api.Features.Attempts;
using QuizBuilder.Api.Models;
using QuizBuilder.Api.Tests.Support;

namespace QuizBuilder.Api.Tests.Features.Attempts;

public class SubmitAttemptCommandHandlerTests
{
    private static QuizAttemptDto CreateAttemptDto(Guid quizId) => new()
    {
        Id = Guid.NewGuid().ToString(),
        QuizId = quizId.ToString(),
        StartedAt = DateTimeOffset.UtcNow.ToString("o"),
        Responses = [],
    };

    private static SubmitAttemptCommandHandler CreateHandler(
        QuizBuilderDbContext db, IAttemptWebhookSender webhookSender, IAttemptReportEmailSender reportEmailSender) =>
        new(db, TestSupport.CreateAttemptMapper(), webhookSender, reportEmailSender);

    [Fact]
    public async Task Returns_QuizNotFound_and_saves_nothing_when_the_quiz_does_not_exist()
    {
        await using var db = TestSupport.CreateDbContext();
        var webhookSender = Substitute.For<IAttemptWebhookSender>();
        var reportEmailSender = Substitute.For<IAttemptReportEmailSender>();
        var handler = CreateHandler(db, webhookSender, reportEmailSender);
        var quizId = Guid.NewGuid();

        var result = await handler.Handle(new SubmitAttemptCommand(quizId, CreateAttemptDto(quizId)), CancellationToken.None);

        Assert.Equal(SubmitAttemptResult.QuizNotFound, result);
        Assert.Empty(db.QuizAttempts);
        await webhookSender.DidNotReceive().NotifyAsync(Arg.Any<Quiz>(), Arg.Any<QuizAttempt>(), Arg.Any<CancellationToken>());
        await reportEmailSender.DidNotReceive().SendAsync(Arg.Any<Quiz>(), Arg.Any<QuizAttemptDto>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Saves_the_attempt_and_returns_Ok_when_the_quiz_exists()
    {
        await using var db = TestSupport.CreateDbContext();
        var quiz = new Quiz { Id = Guid.NewGuid(), Title = "Real quiz" };
        db.Quizzes.Add(quiz);
        await db.SaveChangesAsync();

        var handler = CreateHandler(db, Substitute.For<IAttemptWebhookSender>(), Substitute.For<IAttemptReportEmailSender>());
        var dto = CreateAttemptDto(quiz.Id);

        var result = await handler.Handle(new SubmitAttemptCommand(quiz.Id, dto), CancellationToken.None);

        Assert.Equal(SubmitAttemptResult.Ok, result);
        var saved = await db.QuizAttempts.SingleAsync();
        Assert.Equal(quiz.Id, saved.QuizId);
    }

    [Fact]
    public async Task Notifies_the_webhook_sender_with_the_quiz_and_saved_attempt_on_success()
    {
        await using var db = TestSupport.CreateDbContext();
        var quiz = new Quiz { Id = Guid.NewGuid(), Title = "Real quiz", WebhookUrl = "https://example.com/hook" };
        db.Quizzes.Add(quiz);
        await db.SaveChangesAsync();

        var webhookSender = Substitute.For<IAttemptWebhookSender>();
        var handler = CreateHandler(db, webhookSender, Substitute.For<IAttemptReportEmailSender>());
        var dto = CreateAttemptDto(quiz.Id);

        await handler.Handle(new SubmitAttemptCommand(quiz.Id, dto), CancellationToken.None);

        await webhookSender.Received(1).NotifyAsync(
            Arg.Is<Quiz>(q => q.Id == quiz.Id),
            Arg.Is<QuizAttempt>(a => a.Id.ToString() == dto.Id),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Sends_the_report_email_with_the_quiz_and_original_dto_on_success()
    {
        await using var db = TestSupport.CreateDbContext();
        var quiz = new Quiz { Id = Guid.NewGuid(), Title = "Real quiz" };
        db.Quizzes.Add(quiz);
        await db.SaveChangesAsync();

        var reportEmailSender = Substitute.For<IAttemptReportEmailSender>();
        var handler = CreateHandler(db, Substitute.For<IAttemptWebhookSender>(), reportEmailSender);
        var dto = CreateAttemptDto(quiz.Id);

        await handler.Handle(new SubmitAttemptCommand(quiz.Id, dto), CancellationToken.None);

        await reportEmailSender.Received(1).SendAsync(
            Arg.Is<Quiz>(q => q.Id == quiz.Id),
            Arg.Is<QuizAttemptDto>(a => a.Id == dto.Id),
            Arg.Any<CancellationToken>());
    }
}
