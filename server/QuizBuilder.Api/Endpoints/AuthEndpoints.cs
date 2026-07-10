using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using QuizBuilder.Api.Features.Auth;

namespace QuizBuilder.Api.Endpoints;

public record LoginRequest(string Username, string Password);
public record AuthStatusResponse(bool IsAdmin);

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth");

        group.MapPost("/login", async (LoginRequest request, ISender sender, HttpContext http) =>
        {
            var success = await sender.Send(new LoginCommand(request.Username, request.Password));
            if (!success)
            {
                return Results.Unauthorized();
            }

            var claims = new List<Claim> { new(ClaimTypes.Name, request.Username), new(ClaimTypes.Role, "admin") };
            var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            await http.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(identity));

            return Results.Ok(new AuthStatusResponse(true));
        });

        group.MapPost("/logout", async (HttpContext http) =>
        {
            await http.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Results.Ok();
        });

        group.MapGet("/me", (HttpContext http) =>
            Results.Ok(new AuthStatusResponse(http.User.IsInRole("admin"))));
    }
}
