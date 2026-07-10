using Microsoft.EntityFrameworkCore;
using QuizBuilder.Api.Data;
using QuizBuilder.Api.Dto;
using QuizBuilder.Api.Mapping;
using QuizBuilder.Api.Models;

namespace QuizBuilder.Api.Endpoints;

public static class QuizzesEndpoints
{
    public static void MapQuizzesEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/quizzes");

        group.MapGet("/", async (QuizBuilderDbContext db, HttpContext http) =>
        {
            var quizzes = await FullQuizQuery(db).ToListAsync();
            var isAdmin = http.User.IsInRole("admin");
            var visible = isAdmin
                ? quizzes
                : quizzes.Where(q =>
                    (q.Published ?? true) && (q.ExpiresAt == null || q.ExpiresAt > DateTimeOffset.UtcNow));
            return Results.Ok(visible.Select(QuizMapper.ToDto));
        });

        group.MapGet("/{id:guid}", async (Guid id, QuizBuilderDbContext db) =>
        {
            // Not filtered by published/expiry: the runner needs the settings themselves
            // to show a "not published" / "expired" message instead of the form.
            var quiz = await FullQuizQuery(db).FirstOrDefaultAsync(q => q.Id == id);
            return quiz is null ? Results.NotFound() : Results.Ok(QuizMapper.ToDto(quiz));
        });

        group.MapPut("/{id:guid}", async (Guid id, QuizDto dto, QuizBuilderDbContext db, HttpContext http) =>
        {
            if (!http.User.IsInRole("admin"))
            {
                return Results.Forbid();
            }
            if (id.ToString() != dto.Id)
            {
                return Results.BadRequest();
            }

            var existing = await FullQuizQuery(db).FirstOrDefaultAsync(q => q.Id == id);
            if (existing is null)
            {
                var created = new Quiz { Id = id, Title = dto.Title };
                QuizMapper.ApplyScalarsTo(created, dto);
                var (newPages, newQuestions) = QuizMapper.BuildChildren(dto, id);
                created.Pages = newPages;
                created.Questions = newQuestions;
                db.Quizzes.Add(created);
                await db.SaveChangesAsync();
            }
            else
            {
                // Full replace of the quiz definition on every save; Attempts are untouched.
                // The incoming pages/questions often reuse the same ids as the ones just
                // removed (edits keep client-generated ids stable) - deleting and re-adding
                // within a single SaveChanges would track two entities under the same key,
                // so the delete is flushed first before the replacement rows are added.
                db.QuizPages.RemoveRange(existing.Pages);
                db.Questions.RemoveRange(existing.Questions);
                await db.SaveChangesAsync();

                QuizMapper.ApplyScalarsTo(existing, dto);
                var (newPages, newQuestions) = QuizMapper.BuildChildren(dto, id);
                // AddRange rather than assigning existing.Pages/Questions: with client-set
                // (non-default) GUID keys, EF Core only reliably tracks new entities as
                // "Added" when explicitly added - picking them up via a navigation-property
                // assignment on an already-tracked parent treats them as pre-existing and
                // issues UPDATE statements against rows that don't exist yet.
                db.QuizPages.AddRange(newPages);
                db.Questions.AddRange(newQuestions);
                await db.SaveChangesAsync();
            }

            return Results.Ok();
        });

        group.MapDelete("/{id:guid}", async (Guid id, QuizBuilderDbContext db, HttpContext http) =>
        {
            if (!http.User.IsInRole("admin"))
            {
                return Results.Forbid();
            }
            var quiz = await db.Quizzes.FindAsync(id);
            if (quiz is null)
            {
                return Results.NotFound();
            }
            db.Quizzes.Remove(quiz);
            await db.SaveChangesAsync();
            return Results.Ok();
        });
    }

    private static IQueryable<Quiz> FullQuizQuery(QuizBuilderDbContext db) =>
        db.Quizzes
            .Include(q => q.Pages)
            .Include(q => q.Questions).ThenInclude(q => q.Options)
            .Include(q => q.Questions).ThenInclude(q => (q as MatchingQuestion)!.Pairs)
            .Include(q => q.Questions).ThenInclude(q => (q as HotspotQuestion)!.Regions)
            .Include(q => q.Questions).ThenInclude(q => (q as FillInTheBlankQuestion)!.Answers)
            .AsSplitQuery();
}
