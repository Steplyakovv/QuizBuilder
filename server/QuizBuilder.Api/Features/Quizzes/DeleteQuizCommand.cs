using MediatR;
using QuizBuilder.Api.Data;

namespace QuizBuilder.Api.Features.Quizzes;

public record DeleteQuizCommand(Guid Id) : IRequest<bool>;

public class DeleteQuizCommandHandler(QuizBuilderDbContext db) : IRequestHandler<DeleteQuizCommand, bool>
{
    public async Task<bool> Handle(DeleteQuizCommand request, CancellationToken cancellationToken)
    {
        var quiz = await db.Quizzes.FindAsync([request.Id], cancellationToken);
        if (quiz is null)
        {
            return false;
        }

        db.Quizzes.Remove(quiz);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }
}
