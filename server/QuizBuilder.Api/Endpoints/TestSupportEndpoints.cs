using MediatR;
using QuizBuilder.Api.Features.TestSupport;

namespace QuizBuilder.Api.Endpoints;

/// <summary>Dev-only; never mapped outside Development - see Program.cs.</summary>
public static class TestSupportEndpoints
{
    public static void MapTestSupportEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/test/reset", async (ISender sender) =>
        {
            await sender.Send(new ResetTestDataCommand());
            return Results.Ok();
        });
    }
}
