using MediatR;
using Microsoft.EntityFrameworkCore;
using QuizBuilder.Api.Auth;
using QuizBuilder.Api.Data;

namespace QuizBuilder.Api.Features.Auth;

/// <summary>
/// Credential check only - building the cookie identity and signing in is an HTTP/cookie-auth
/// concern, not business logic, so it stays in the endpoint.
/// </summary>
public record LoginCommand(string Username, string Password) : IRequest<bool>;

public class LoginCommandHandler(QuizBuilderDbContext db) : IRequestHandler<LoginCommand, bool>
{
    public async Task<bool> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await db.AdminUsers.SingleOrDefaultAsync(u => u.Username == request.Username, cancellationToken);
        return user is not null && PasswordHasher.Verify(request.Password, user.PasswordHash);
    }
}
