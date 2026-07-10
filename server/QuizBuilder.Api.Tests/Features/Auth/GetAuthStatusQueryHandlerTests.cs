using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using NSubstitute;
using QuizBuilder.Api.Features.Auth;

namespace QuizBuilder.Api.Tests.Features.Auth;

public class GetAuthStatusQueryHandlerTests
{
    private static IHttpContextAccessor CreateAccessorWithUser(ClaimsPrincipal user)
    {
        var accessor = Substitute.For<IHttpContextAccessor>();
        accessor.HttpContext.Returns(new DefaultHttpContext { User = user });
        return accessor;
    }

    [Fact]
    public async Task Returns_true_when_the_current_user_is_in_the_admin_role()
    {
        var identity = new ClaimsIdentity([new Claim(ClaimTypes.Role, "admin")], "test");
        var handler = new GetAuthStatusQueryHandler(CreateAccessorWithUser(new ClaimsPrincipal(identity)));

        var result = await handler.Handle(new GetAuthStatusQuery(), CancellationToken.None);

        Assert.True(result);
    }

    [Fact]
    public async Task Returns_false_for_an_unauthenticated_user()
    {
        var handler = new GetAuthStatusQueryHandler(CreateAccessorWithUser(new ClaimsPrincipal(new ClaimsIdentity())));

        var result = await handler.Handle(new GetAuthStatusQuery(), CancellationToken.None);

        Assert.False(result);
    }
}
