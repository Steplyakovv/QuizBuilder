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
        QuizBuilderDbContext db, IAttemptNotificationDispatcher notificationDispatcher) =>
        new(db, TestSupport.CreateAttemptMapper(), notificationDispatcher);

    [Fact]
    public async Task Returns_QuizNotFound_and_saves_nothing_when_the_quiz_does_not_exist()
    {
        await using var db = TestSupport.CreateDbContext();
        var notificationDispatcher = Substitute.For<IAttemptNotificationDispatcher>();
        var handler = CreateHandler(db, notificationDispatcher);
        var quizId = Guid.NewGuid();

        var result = await handler.Handle(new SubmitAttemptCommand(quizId, CreateAttemptDto(quizId)), CancellationToken.None);

        Assert.Equal(SubmitAttemptResult.QuizNotFound, result);
        Assert.Empty(db.QuizAttempts);
        notificationDispatcher.DidNotReceive().Dispatch(Arg.Any<Quiz>(), Arg.Any<QuizAttempt>(), Arg.Any<QuizAttemptDto>());
    }

    [Fact]
    public async Task Saves_the_attempt_and_returns_Ok_when_the_quiz_exists()
    {
        await using var db = TestSupport.CreateDbContext();
        var quiz = new Quiz { Id = Guid.NewGuid(), Title = "Real quiz" };
        db.Quizzes.Add(quiz);
        await db.SaveChangesAsync();

        var handler = CreateHandler(db, Substitute.For<IAttemptNotificationDispatcher>());
        var dto = CreateAttemptDto(quiz.Id);

        var result = await handler.Handle(new SubmitAttemptCommand(quiz.Id, dto), CancellationToken.None);

        Assert.Equal(SubmitAttemptResult.Ok, result);
        var saved = await db.QuizAttempts.SingleAsync();
        Assert.Equal(quiz.Id, saved.QuizId);
    }

    [Fact]
    public async Task Dispatches_notifications_with_the_quiz_and_saved_attempt_on_success()
    {
        await using var db = TestSupport.CreateDbContext();
        var quiz = new Quiz { Id = Guid.NewGuid(), Title = "Real quiz", WebhookUrl = "https://example.com/hook" };
        db.Quizzes.Add(quiz);
        await db.SaveChangesAsync();

        var notificationDispatcher = Substitute.For<IAttemptNotificationDispatcher>();
        var handler = CreateHandler(db, notificationDispatcher);
        var dto = CreateAttemptDto(quiz.Id);

        await handler.Handle(new SubmitAttemptCommand(quiz.Id, dto), CancellationToken.None);

        notificationDispatcher.Received(1).Dispatch(
            Arg.Is<Quiz>(q => q.Id == quiz.Id),
            Arg.Is<QuizAttempt>(a => a.Id.ToString() == dto.Id),
            Arg.Is<QuizAttemptDto>(a => a.Id == dto.Id));
    }
}
