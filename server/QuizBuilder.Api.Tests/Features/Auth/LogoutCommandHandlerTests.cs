using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using NSubstitute;
using QuizBuilder.Api.Features.Auth;

namespace QuizBuilder.Api.Tests.Features.Auth;

public class LogoutCommandHandlerTests
{
    [Fact]
    public async Task Signs_out_the_cookie_authentication_scheme()
    {
        var authService = Substitute.For<IAuthenticationService>();
        var services = new ServiceCollection().AddSingleton(authService).BuildServiceProvider();
        var httpContext = new DefaultHttpContext { RequestServices = services };
        var accessor = Substitute.For<IHttpContextAccessor>();
        accessor.HttpContext.Returns(httpContext);
        var handler = new LogoutCommandHandler(accessor);

        await handler.Handle(new LogoutCommand(), CancellationToken.None);

        await authService.Received(1).SignOutAsync(
            httpContext, CookieAuthenticationDefaults.AuthenticationScheme, Arg.Any<AuthenticationProperties?>());
    }
}
