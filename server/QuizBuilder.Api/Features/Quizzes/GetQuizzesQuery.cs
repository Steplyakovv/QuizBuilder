using MediatR;
using Microsoft.EntityFrameworkCore;
using QuizBuilder.Api.Data;
using QuizBuilder.Api.Dto;
using QuizBuilder.Api.Mapping;

namespace QuizBuilder.Api.Features.Quizzes;

public record GetQuizzesQuery(bool IsAdmin) : IRequest<List<QuizDto>>;

public class GetQuizzesQueryHandler(QuizBuilderDbContext db, IQuizMapper mapper) : IRequestHandler<GetQuizzesQuery, List<QuizDto>>
{
    public async Task<List<QuizDto>> Handle(GetQuizzesQuery request, CancellationToken cancellationToken)
    {
        var quizzes = await QuizQueries.FullQuizQuery(db).ToListAsync(cancellationToken);
        var visible = request.IsAdmin
            ? quizzes
            : quizzes.Where(q => (q.Published ?? true) && (q.ExpiresAt == null || q.ExpiresAt > DateTimeOffset.UtcNow));
        return visible.Select(mapper.ToDto).ToList();
    }
}
