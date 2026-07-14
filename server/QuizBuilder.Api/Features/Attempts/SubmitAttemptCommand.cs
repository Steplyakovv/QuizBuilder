using MediatR;
using Microsoft.EntityFrameworkCore;
using QuizBuilder.Api.Data;
using QuizBuilder.Api.Dto;
using QuizBuilder.Api.Mapping;

namespace QuizBuilder.Api.Features.Attempts;

public enum SubmitAttemptResult { Ok, QuizNotFound }

/// <summary>Public: a respondent submitting their completed attempt.</summary>
public record SubmitAttemptCommand(Guid QuizId, QuizAttemptDto Attempt) : IRequest<SubmitAttemptResult>;

public class SubmitAttemptCommandHandler(
    QuizBuilderDbContext db,
    IAttemptMapper mapper,
    IAttemptNotificationDispatcher notificationDispatcher) : IRequestHandler<SubmitAttemptCommand, SubmitAttemptResult>
{
    public async Task<SubmitAttemptResult> Handle(SubmitAttemptCommand request, CancellationToken cancellationToken)
    {
        var quiz = await db.Quizzes.FirstOrDefaultAsync(q => q.Id == request.QuizId, cancellationToken);
        if (quiz is null)
        {
            return SubmitAttemptResult.QuizNotFound;
        }

        var attempt = mapper.ToEntity(request.Attempt);
        db.QuizAttempts.Add(attempt);
        await db.SaveChangesAsync(cancellationToken);

        notificationDispatcher.Dispatch(quiz, attempt, request.Attempt);
        return SubmitAttemptResult.Ok;
    }
}
