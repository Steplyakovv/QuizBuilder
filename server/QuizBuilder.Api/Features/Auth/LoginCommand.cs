using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using QuizBuilder.Api.Auth;
using QuizBuilder.Api.Data;

namespace QuizBuilder.Api.Features.Auth;

public record LoginCommand(string Username, string Password) : IRequest<bool>;

public class LoginCommandHandler(QuizBuilderDbContext db, IHttpContextAccessor httpContextAccessor) : IRequestHandler<LoginCommand, bool>
{
    public async Task<bool> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await db.AdminUsers.SingleOrDefaultAsync(u => u.Username == request.Username, cancellationToken);
        if (user is null || !PasswordHasher.Verify(request.Password, user.PasswordHash))
        {
            return false;
        }

        var claims = new List<Claim> { new(ClaimTypes.Name, request.Username), new(ClaimTypes.Role, "admin") };
        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        await httpContextAccessor.HttpContext!.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(identity));

        return true;
    }
}
