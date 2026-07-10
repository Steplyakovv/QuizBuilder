using Microsoft.EntityFrameworkCore;
using QuizBuilder.Api.Data;
using QuizBuilder.Api.Dto;
using QuizBuilder.Api.Mapping;

namespace QuizBuilder.Api.Endpoints;

public static class AttemptsEndpoints
{
    public static void MapAttemptsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/quizzes/{quizId:guid}/attempts");

        // Public: a respondent submitting their completed attempt.
        group.MapPost("/", async (Guid quizId, QuizAttemptDto dto, QuizBuilderDbContext db) =>
        {
            if (quizId.ToString() != dto.QuizId)
            {
                return Results.BadRequest();
            }
            if (!await db.Quizzes.AnyAsync(q => q.Id == quizId))
            {
                return Results.NotFound();
            }

            db.QuizAttempts.Add(AttemptMapper.ToEntity(dto));
            await db.SaveChangesAsync();
            return Results.Ok();
        });

        group.MapGet("/", async (Guid quizId, QuizBuilderDbContext db, HttpContext http) =>
        {
            if (!http.User.IsInRole("admin"))
            {
                return Results.Forbid();
            }

            var attempts = await db.QuizAttempts
                .Where(a => a.QuizId == quizId)
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
                .ToListAsync();

            return Results.Ok(attempts.Select(AttemptMapper.ToDto));
        });
    }
}
