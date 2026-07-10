using Microsoft.EntityFrameworkCore;
using QuizBuilder.Api.Dto;
using QuizBuilder.Api.Features.Quizzes;
using QuizBuilder.Api.Tests.Support;

namespace QuizBuilder.Api.Tests.Features.Quizzes;

public class SaveQuizCommandHandlerTests
{
    [Fact]
    public async Task Creates_a_new_quiz_when_none_exists_with_that_id()
    {
        await using var db = TestSupport.CreateDbContext();
        var handler = new SaveQuizCommandHandler(db, TestSupport.CreateQuizMapper());
        var id = Guid.NewGuid();
        var dto = TestSupport.CreateQuizDto(id, "Brand new quiz");

        await handler.Handle(new SaveQuizCommand(id, dto), CancellationToken.None);

        var saved = await db.Quizzes.Include(q => q.Questions).SingleAsync(q => q.Id == id);
        Assert.Equal("Brand new quiz", saved.Title);
        Assert.Single(saved.Questions);
    }

    [Fact]
    public async Task Updating_an_existing_quiz_replaces_its_questions_instead_of_duplicating_them()
    {
        // Regression test for the EF Core Added-vs-Modified tracking bug: saving twice with
        // client-generated GUID ids used to throw DbUpdateConcurrencyException, or (if mapped
        // wrong in the other direction) leave stale rows behind instead of replacing them.
        await using var db = TestSupport.CreateDbContext();
        var mapper = TestSupport.CreateQuizMapper();
        var id = Guid.NewGuid();
        var firstQuestionId = Guid.NewGuid().ToString();
        var firstVersion = TestSupport.CreateQuizDto(id, "v1") with
        {
            Questions = [new TextQuestionDto { Id = firstQuestionId, Prompt = "Question 1", Required = false }],
        };
        await new SaveQuizCommandHandler(db, mapper).Handle(new SaveQuizCommand(id, firstVersion), CancellationToken.None);

        var secondQuestionId = Guid.NewGuid().ToString();
        var secondVersion = TestSupport.CreateQuizDto(id, "v2") with
        {
            Questions = [new TextQuestionDto { Id = secondQuestionId, Prompt = "Question 2", Required = false }],
        };
        await new SaveQuizCommandHandler(db, mapper).Handle(new SaveQuizCommand(id, secondVersion), CancellationToken.None);

        var saved = await db.Quizzes.Include(q => q.Questions).SingleAsync(q => q.Id == id);
        Assert.Equal("v2", saved.Title);
        var question = Assert.Single(saved.Questions);
        Assert.Equal(Guid.Parse(secondQuestionId), question.Id);
        Assert.Equal("Question 2", question.Prompt);
    }

    [Fact]
    public async Task Reusing_the_same_question_id_across_an_edit_does_not_throw()
    {
        // The common real-world case: editing a quiz in place keeps the same question ids.
        await using var db = TestSupport.CreateDbContext();
        var mapper = TestSupport.CreateQuizMapper();
        var id = Guid.NewGuid();
        var questionId = Guid.NewGuid().ToString();
        var v1 = TestSupport.CreateQuizDto(id, "v1") with
        {
            Questions = [new TextQuestionDto { Id = questionId, Prompt = "Original prompt", Required = false }],
        };
        await new SaveQuizCommandHandler(db, mapper).Handle(new SaveQuizCommand(id, v1), CancellationToken.None);

        var v2 = TestSupport.CreateQuizDto(id, "v1") with
        {
            Questions = [new TextQuestionDto { Id = questionId, Prompt = "Edited prompt", Required = false }],
        };
        await new SaveQuizCommandHandler(db, mapper).Handle(new SaveQuizCommand(id, v2), CancellationToken.None);

        var saved = await db.Quizzes.Include(q => q.Questions).SingleAsync(q => q.Id == id);
        var question = Assert.Single(saved.Questions);
        Assert.Equal("Edited prompt", question.Prompt);
    }
}
