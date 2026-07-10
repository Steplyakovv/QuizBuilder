using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using QuizBuilder.Api.Auth;
using QuizBuilder.Api.Data;

namespace QuizBuilder.Api.Endpoints;

public record LoginRequest(string Username, string Password);
public record AuthStatusResponse(bool IsAdmin);

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth");

        group.MapPost("/login", async (LoginRequest request, QuizBuilderDbContext db, HttpContext http) =>
        {
            var user = await db.AdminUsers.SingleOrDefaultAsync(u => u.Username == request.Username);
            if (user is null || !PasswordHasher.Verify(request.Password, user.PasswordHash))
            {
                return Results.Unauthorized();
            }

            var claims = new List<Claim> { new(ClaimTypes.Name, user.Username), new(ClaimTypes.Role, "admin") };
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
