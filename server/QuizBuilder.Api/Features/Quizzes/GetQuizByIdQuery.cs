using MediatR;
using Microsoft.EntityFrameworkCore;
using QuizBuilder.Api.Data;
using QuizBuilder.Api.Dto;
using QuizBuilder.Api.Mapping;

namespace QuizBuilder.Api.Features.Quizzes;

/// <summary>
/// Not filtered by published/expiry: the runner needs the settings themselves to show a
/// "not published" / "expired" message instead of the form.
/// </summary>
public record GetQuizByIdQuery(Guid Id) : IRequest<QuizDto?>;

public class GetQuizByIdQueryHandler(QuizBuilderDbContext db, IQuizMapper mapper) : IRequestHandler<GetQuizByIdQuery, QuizDto?>
{
    public async Task<QuizDto?> Handle(GetQuizByIdQuery request, CancellationToken cancellationToken)
    {
        var quiz = await QuizQueries.FullQuizQuery(db).FirstOrDefaultAsync(q => q.Id == request.Id, cancellationToken);
        return quiz is null ? null : mapper.ToDto(quiz);
    }
}
