using QuizBuilder.Api.Features.Quizzes;
using QuizBuilder.Api.Models;
using QuizBuilder.Api.Tests.Support;

namespace QuizBuilder.Api.Tests.Features.Quizzes;

public class GetQuizzesQueryHandlerTests
{
    [Fact]
    public async Task Admin_sees_unpublished_and_expired_quizzes()
    {
        await using var db = TestSupport.CreateDbContext();
        db.Quizzes.AddRange(
            new Quiz { Id = Guid.NewGuid(), Title = "Draft", Published = false },
            new Quiz { Id = Guid.NewGuid(), Title = "Expired", ExpiresAt = DateTimeOffset.UtcNow.AddDays(-1) },
            new Quiz { Id = Guid.NewGuid(), Title = "Live" });
        await db.SaveChangesAsync();

        var handler = new GetQuizzesQueryHandler(db, TestSupport.CreateQuizMapper());
        var result = await handler.Handle(new GetQuizzesQuery(IsAdmin: true), CancellationToken.None);

        Assert.Equal(3, result.Count);
    }

    [Fact]
    public async Task Non_admin_only_sees_published_unexpired_quizzes()
    {
        await using var db = TestSupport.CreateDbContext();
        db.Quizzes.AddRange(
            new Quiz { Id = Guid.NewGuid(), Title = "Draft", Published = false },
            new Quiz { Id = Guid.NewGuid(), Title = "Expired", ExpiresAt = DateTimeOffset.UtcNow.AddDays(-1) },
            new Quiz { Id = Guid.NewGuid(), Title = "Live" },
            new Quiz { Id = Guid.NewGuid(), Title = "PublishedExplicitly", Published = true });
        await db.SaveChangesAsync();

        var handler = new GetQuizzesQueryHandler(db, TestSupport.CreateQuizMapper());
        var result = await handler.Handle(new GetQuizzesQuery(IsAdmin: false), CancellationToken.None);

        Assert.Equal(["Live", "PublishedExplicitly"], result.Select(q => q.Title).OrderBy(t => t));
    }
}
