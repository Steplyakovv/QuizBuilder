using MediatR;
using Microsoft.EntityFrameworkCore;
using QuizBuilder.Api.Data;

namespace QuizBuilder.Api.Features.TestSupport;

/// <summary>
/// Dev/test-only: lets Playwright isolate each e2e test against the shared local Postgres
/// instance (there's no per-worker database in this setup). Never dispatched outside
/// Development - see Program.cs / TestSupportEndpoints.
/// </summary>
public record ResetTestDataCommand : IRequest;

public class ResetTestDataCommandHandler(QuizBuilderDbContext db) : IRequestHandler<ResetTestDataCommand>
{
    public async Task Handle(ResetTestDataCommand request, CancellationToken cancellationToken)
    {
        await db.Database.ExecuteSqlRawAsync("TRUNCATE quizzes, quiz_attempts RESTART IDENTITY CASCADE", cancellationToken);
    }
}
