using QuizBuilder.Api.Features.Attempts;
using QuizBuilder.Api.Models;
using QuizBuilder.Api.Tests.Support;

namespace QuizBuilder.Api.Tests.Features.Attempts;

public class GetAttemptsQueryHandlerTests
{
    [Fact]
    public async Task Returns_only_attempts_for_the_requested_quiz()
    {
        await using var db = TestSupport.CreateDbContext();
        var quizA = new Quiz { Id = Guid.NewGuid(), Title = "Quiz A" };
        var quizB = new Quiz { Id = Guid.NewGuid(), Title = "Quiz B" };
        db.Quizzes.AddRange(quizA, quizB);
        db.QuizAttempts.AddRange(
            new QuizAttempt { Id = Guid.NewGuid(), QuizId = quizA.Id, StartedAt = DateTimeOffset.UtcNow, RespondentName = "A1" },
            new QuizAttempt { Id = Guid.NewGuid(), QuizId = quizA.Id, StartedAt = DateTimeOffset.UtcNow, RespondentName = "A2" },
            new QuizAttempt { Id = Guid.NewGuid(), QuizId = quizB.Id, StartedAt = DateTimeOffset.UtcNow, RespondentName = "B1" });
        await db.SaveChangesAsync();

        var handler = new GetAttemptsQueryHandler(db, TestSupport.CreateAttemptMapper());
        var result = await handler.Handle(new GetAttemptsQuery(quizA.Id), CancellationToken.None);

        Assert.Equal(["A1", "A2"], result.Select(a => a.RespondentName).OrderBy(n => n));
    }

    [Fact]
    public async Task Returns_an_empty_list_when_the_quiz_has_no_attempts()
    {
        await using var db = TestSupport.CreateDbContext();
        var handler = new GetAttemptsQueryHandler(db, TestSupport.CreateAttemptMapper());

        var result = await handler.Handle(new GetAttemptsQuery(Guid.NewGuid()), CancellationToken.None);

        Assert.Empty(result);
    }
}
