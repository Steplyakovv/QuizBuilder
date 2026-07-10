using MediatR;

namespace QuizBuilder.Api.Features.Auth;

public record GetAuthStatusQuery : IRequest<bool>;

public class GetAuthStatusQueryHandler(IHttpContextAccessor httpContextAccessor) : IRequestHandler<GetAuthStatusQuery, bool>
{
    public Task<bool> Handle(GetAuthStatusQuery request, CancellationToken cancellationToken) =>
        Task.FromResult(httpContextAccessor.HttpContext!.User.IsInRole("admin"));
}
