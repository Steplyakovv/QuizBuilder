using MediatR;
using Microsoft.EntityFrameworkCore;
using QuizBuilder.Api.Data;
using QuizBuilder.Api.Dto;
using QuizBuilder.Api.Mapping;
using QuizBuilder.Api.Models;

namespace QuizBuilder.Api.Features.Quizzes;

/// <summary>Full replace of the quiz definition on every save; attempts are untouched.</summary>
public record SaveQuizCommand(Guid Id, QuizDto Quiz) : IRequest;

public class SaveQuizCommandHandler(QuizBuilderDbContext db, IQuizMapper mapper) : IRequestHandler<SaveQuizCommand>
{
    public async Task Handle(SaveQuizCommand request, CancellationToken cancellationToken)
    {
        var (id, dto) = (request.Id, request.Quiz);
        var existing = await QuizQueries.FullQuizQuery(db).FirstOrDefaultAsync(q => q.Id == id, cancellationToken);
        if (existing is null)
        {
            var created = new Quiz { Id = id, Title = dto.Title };
            mapper.ApplyScalarsTo(created, dto);
            var (newPages, newQuestions) = mapper.BuildChildren(dto, id);
            created.Pages = newPages;
            created.Questions = newQuestions;
            db.Quizzes.Add(created);
            await db.SaveChangesAsync(cancellationToken);
        }
        else
        {
            // The incoming pages/questions often reuse the same ids as the ones just
            // removed (edits keep client-generated ids stable) - deleting and re-adding
            // within a single SaveChanges would track two entities under the same key,
            // so the delete is flushed first before the replacement rows are added.
            db.QuizPages.RemoveRange(existing.Pages);
            db.Questions.RemoveRange(existing.Questions);
            await db.SaveChangesAsync(cancellationToken);

            mapper.ApplyScalarsTo(existing, dto);
            var (newPages, newQuestions) = mapper.BuildChildren(dto, id);
            // AddRange rather than assigning existing.Pages/Questions: with client-set
            // (non-default) GUID keys, EF Core only reliably tracks new entities as
            // "Added" when explicitly added - picking them up via a navigation-property
            // assignment on an already-tracked parent treats them as pre-existing and
            // issues UPDATE statements against rows that don't exist yet.
            db.QuizPages.AddRange(newPages);
            db.Questions.AddRange(newQuestions);
            await db.SaveChangesAsync(cancellationToken);
        }
    }
}
