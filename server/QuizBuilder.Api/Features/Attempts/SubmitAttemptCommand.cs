using MediatR;
using Microsoft.EntityFrameworkCore;
using QuizBuilder.Api.Data;
using QuizBuilder.Api.Dto;
using QuizBuilder.Api.Mapping;

namespace QuizBuilder.Api.Features.Attempts;

public enum SubmitAttemptResult { Ok, QuizNotFound }

/// <summary>Public: a respondent submitting their completed attempt.</summary>
public record SubmitAttemptCommand(Guid QuizId, QuizAttemptDto Attempt) : IRequest<SubmitAttemptResult>;

public class SubmitAttemptCommandHandler(QuizBuilderDbContext db, IAttemptMapper mapper) : IRequestHandler<SubmitAttemptCommand, SubmitAttemptResult>
{
    public async Task<SubmitAttemptResult> Handle(SubmitAttemptCommand request, CancellationToken cancellationToken)
    {
        if (!await db.Quizzes.AnyAsync(q => q.Id == request.QuizId, cancellationToken))
        {
            return SubmitAttemptResult.QuizNotFound;
        }

        db.QuizAttempts.Add(mapper.ToEntity(request.Attempt));
        await db.SaveChangesAsync(cancellationToken);
        return SubmitAttemptResult.Ok;
    }
}
