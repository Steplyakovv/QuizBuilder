using Microsoft.EntityFrameworkCore;
using QuizBuilder.Api.Data;

namespace QuizBuilder.Api.Endpoints;

/// <summary>
/// Dev/test-only endpoint so Playwright can isolate each e2e test against the shared
/// local Postgres instance (there's no per-worker database in this setup). Never mapped
/// outside Development - see Program.cs.
/// </summary>
public static class TestSupportEndpoints
{
    public static void MapTestSupportEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/test/reset", async (QuizBuilderDbContext db) =>
        {
            await db.Database.ExecuteSqlRawAsync("TRUNCATE quizzes, quiz_attempts RESTART IDENTITY CASCADE");
            return Results.Ok();
        });
    }
}
