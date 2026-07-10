using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using NSubstitute;
using QuizBuilder.Api.Auth;
using QuizBuilder.Api.Features.Auth;
using QuizBuilder.Api.Models;
using QuizBuilder.Api.Tests.Support;

namespace QuizBuilder.Api.Tests.Features.Auth;

public class LoginCommandHandlerTests
{
    private static (IHttpContextAccessor Accessor, IAuthenticationService AuthService) CreateHttpContextWithAuthService()
    {
        var authService = Substitute.For<IAuthenticationService>();
        var services = new ServiceCollection().AddSingleton(authService).BuildServiceProvider();
        var httpContext = new DefaultHttpContext { RequestServices = services };
        var accessor = Substitute.For<IHttpContextAccessor>();
        accessor.HttpContext.Returns(httpContext);
        return (accessor, authService);
    }

    [Fact]
    public async Task Returns_false_and_does_not_sign_in_for_an_unknown_username()
    {
        await using var db = TestSupport.CreateDbContext();
        var (accessor, authService) = CreateHttpContextWithAuthService();
        var handler = new LoginCommandHandler(db, accessor);

        var result = await handler.Handle(new LoginCommand("nobody", "admin"), CancellationToken.None);

        Assert.False(result);
        await authService.DidNotReceive().SignInAsync(
            Arg.Any<HttpContext>(), Arg.Any<string>(), Arg.Any<ClaimsPrincipal>(), Arg.Any<AuthenticationProperties?>());
    }

    [Fact]
    public async Task Returns_false_and_does_not_sign_in_for_the_wrong_password()
    {
        await using var db = TestSupport.CreateDbContext();
        db.AdminUsers.Add(new AdminUser { Id = Guid.NewGuid(), Username = "admin", PasswordHash = PasswordHasher.Hash("correct-password") });
        await db.SaveChangesAsync();
        var (accessor, authService) = CreateHttpContextWithAuthService();
        var handler = new LoginCommandHandler(db, accessor);

        var result = await handler.Handle(new LoginCommand("admin", "wrong-password"), CancellationToken.None);

        Assert.False(result);
        await authService.DidNotReceive().SignInAsync(
            Arg.Any<HttpContext>(), Arg.Any<string>(), Arg.Any<ClaimsPrincipal>(), Arg.Any<AuthenticationProperties?>());
    }

    [Fact]
    public async Task Returns_true_and_signs_in_an_admin_principal_for_correct_credentials()
    {
        await using var db = TestSupport.CreateDbContext();
        db.AdminUsers.Add(new AdminUser { Id = Guid.NewGuid(), Username = "admin", PasswordHash = PasswordHasher.Hash("correct-password") });
        await db.SaveChangesAsync();
        var (accessor, authService) = CreateHttpContextWithAuthService();
        var handler = new LoginCommandHandler(db, accessor);

        var result = await handler.Handle(new LoginCommand("admin", "correct-password"), CancellationToken.None);

        Assert.True(result);
        await authService.Received(1).SignInAsync(
            accessor.HttpContext!,
            CookieAuthenticationDefaults.AuthenticationScheme,
            Arg.Is<ClaimsPrincipal>(p => p.IsInRole("admin") && p.Identity!.Name == "admin"),
            Arg.Any<AuthenticationProperties?>());
    }
}
