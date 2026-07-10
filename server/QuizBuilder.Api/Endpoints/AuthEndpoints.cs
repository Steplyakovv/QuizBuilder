using MediatR;
using QuizBuilder.Api.Features.Auth;

namespace QuizBuilder.Api.Endpoints;

public record LoginRequest(string Username, string Password);
public record AuthStatusResponse(bool IsAdmin);

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth");

        group.MapPost("/login", async (LoginRequest request, ISender sender) =>
        {
            var success = await sender.Send(new LoginCommand(request.Username, request.Password));
            return success ? Results.Ok(new AuthStatusResponse(true)) : Results.Unauthorized();
        });

        group.MapPost("/logout", async (ISender sender) =>
        {
            await sender.Send(new LogoutCommand());
            return Results.Ok();
        });

        group.MapGet("/me", async (ISender sender) =>
            Results.Ok(new AuthStatusResponse(await sender.Send(new GetAuthStatusQuery()))));
    }
}
