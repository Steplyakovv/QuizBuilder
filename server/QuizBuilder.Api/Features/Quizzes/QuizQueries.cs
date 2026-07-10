using Microsoft.EntityFrameworkCore;
using QuizBuilder.Api.Data;
using QuizBuilder.Api.Models;

namespace QuizBuilder.Api.Features.Quizzes;

internal static class QuizQueries
{
    public static IQueryable<Quiz> FullQuizQuery(QuizBuilderDbContext db) =>
        db.Quizzes
            .Include(q => q.Pages)
            .Include(q => q.Questions).ThenInclude(q => q.Options)
            .Include(q => q.Questions).ThenInclude(q => (q as MatchingQuestion)!.Pairs)
            .Include(q => q.Questions).ThenInclude(q => (q as HotspotQuestion)!.Regions)
            .Include(q => q.Questions).ThenInclude(q => (q as FillInTheBlankQuestion)!.Answers)
            .AsSplitQuery();
}
