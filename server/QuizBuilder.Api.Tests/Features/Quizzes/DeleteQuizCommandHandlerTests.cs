using QuizBuilder.Api.Features.Quizzes;
using QuizBuilder.Api.Models;
using QuizBuilder.Api.Tests.Support;

namespace QuizBuilder.Api.Tests.Features.Quizzes;

public class DeleteQuizCommandHandlerTests
{
    [Fact]
    public async Task Returns_true_and_removes_the_quiz_when_it_exists()
    {
        await using var db = TestSupport.CreateDbContext();
        var quiz = new Quiz { Id = Guid.NewGuid(), Title = "Doomed" };
        db.Quizzes.Add(quiz);
        await db.SaveChangesAsync();

        var result = await new DeleteQuizCommandHandler(db).Handle(new DeleteQuizCommand(quiz.Id), CancellationToken.None);

        Assert.True(result);
        Assert.False(db.Quizzes.Any(q => q.Id == quiz.Id));
    }

    [Fact]
    public async Task Returns_false_when_the_quiz_does_not_exist()
    {
        await using var db = TestSupport.CreateDbContext();

        var result = await new DeleteQuizCommandHandler(db).Handle(new DeleteQuizCommand(Guid.NewGuid()), CancellationToken.None);

        Assert.False(result);
    }
}
