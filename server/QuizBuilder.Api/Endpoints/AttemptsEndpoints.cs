using MediatR;
using QuizBuilder.Api.Dto;
using QuizBuilder.Api.Features.Attempts;

namespace QuizBuilder.Api.Endpoints;

public static class AttemptsEndpoints
{
    public static void MapAttemptsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/quizzes/{quizId:guid}/attempts");

        // Public: a respondent submitting their completed attempt.
        group.MapPost("/", async (Guid quizId, QuizAttemptDto dto, ISender sender) =>
        {
            if (quizId.ToString() != dto.QuizId)
            {
                return Results.BadRequest();
            }

            var result = await sender.Send(new SubmitAttemptCommand(quizId, dto));
            return result == SubmitAttemptResult.QuizNotFound ? Results.NotFound() : Results.Ok();
        });

        group.MapGet("/", async (Guid quizId, ISender sender, HttpContext http) =>
        {
            if (!http.User.IsInRole("admin"))
            {
                return Results.Forbid();
            }

            return Results.Ok(await sender.Send(new GetAttemptsQuery(quizId)));
        });
    }
}
