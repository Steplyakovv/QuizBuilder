using MediatR;
using QuizBuilder.Api.Dto;
using QuizBuilder.Api.Features.Quizzes;

namespace QuizBuilder.Api.Endpoints;

public static class QuizzesEndpoints
{
    public static void MapQuizzesEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/quizzes");

        group.MapGet("/", async (ISender sender, HttpContext http) =>
            Results.Ok(await sender.Send(new GetQuizzesQuery(http.User.IsInRole("admin")))));

        group.MapGet("/{id:guid}", async (Guid id, ISender sender) =>
        {
            var quiz = await sender.Send(new GetQuizByIdQuery(id));
            return quiz is null ? Results.NotFound() : Results.Ok(quiz);
        });

        group.MapPut("/{id:guid}", async (Guid id, QuizDto dto, ISender sender, HttpContext http) =>
        {
            if (!http.User.IsInRole("admin"))
            {
                return Results.Forbid();
            }
            if (id.ToString() != dto.Id)
            {
                return Results.BadRequest();
            }

            await sender.Send(new SaveQuizCommand(id, dto));
            return Results.Ok();
        });

        group.MapDelete("/{id:guid}", async (Guid id, ISender sender, HttpContext http) =>
        {
            if (!http.User.IsInRole("admin"))
            {
                return Results.Forbid();
            }

            var deleted = await sender.Send(new DeleteQuizCommand(id));
            return deleted ? Results.Ok() : Results.NotFound();
        });
    }
}
