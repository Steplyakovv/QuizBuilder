using MediatR;
using Microsoft.EntityFrameworkCore;
using QuizBuilder.Api.Data;
using QuizBuilder.Api.Dto;
using QuizBuilder.Api.Mapping;

namespace QuizBuilder.Api.Features.Attempts;

public record GetAttemptsQuery(Guid QuizId) : IRequest<List<QuizAttemptDto>>;

public class GetAttemptsQueryHandler(QuizBuilderDbContext db, IAttemptMapper mapper) : IRequestHandler<GetAttemptsQuery, List<QuizAttemptDto>>
{
    public async Task<List<QuizAttemptDto>> Handle(GetAttemptsQuery request, CancellationToken cancellationToken)
    {
        var attempts = await db.QuizAttempts
            .Where(a => a.QuizId == request.QuizId)
            .Include(a => a.Quiz)
            .Include(a => a.Responses).ThenInclude(r => r.SelectedOptions)
            .Include(a => a.Responses).ThenInclude(r => r.Distributions)
            .Include(a => a.Responses).ThenInclude(r => r.Blanks)
            .Include(a => a.Responses).ThenInclude(r => r.Matches)
            .Include(a => a.Responses).ThenInclude(r => r.File)
            .Include(a => a.QuestionSnapshots).ThenInclude(s => s.Options)
            .Include(a => a.QuestionSnapshots).ThenInclude(s => s.Pairs)
            .Include(a => a.QuestionSnapshots).ThenInclude(s => s.Regions)
            .Include(a => a.QuestionSnapshots).ThenInclude(s => s.Answers)
            .AsSplitQuery()
            .ToListAsync(cancellationToken);

        return attempts.Select(mapper.ToDto).ToList();
    }
}
