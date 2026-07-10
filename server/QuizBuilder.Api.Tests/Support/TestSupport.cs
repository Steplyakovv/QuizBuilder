using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using QuizBuilder.Api.Data;
using QuizBuilder.Api.Dto;
using QuizBuilder.Api.Mapping;

namespace QuizBuilder.Api.Tests.Support;

/// <summary>Shared setup for handler tests: a fresh InMemory DbContext and the real mappers
/// (not mocked - handler tests should exercise the actual mapping logic, not a stand-in).</summary>
internal static class TestSupport
{
    public static QuizBuilderDbContext CreateDbContext() =>
        new(new DbContextOptionsBuilder<QuizBuilderDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

    public static IQuestionMapper CreateQuestionMapper() => new QuestionMapper();

    /// <summary>Registers AutoMapper the same way Program.cs does (AddAutoMapper against the
    /// assembly containing the profiles) rather than hand-building a MapperConfiguration, so
    /// tests exercise the exact same profile wiring production uses.</summary>
    public static IMapper CreateAutoMapper() =>
        new ServiceCollection()
            .AddLogging()
            .AddAutoMapper(cfg => { }, typeof(QuizMappingProfile).Assembly)
            .BuildServiceProvider()
            .GetRequiredService<IMapper>();

    public static IQuizMapper CreateQuizMapper() => new QuizMapper(CreateAutoMapper(), CreateQuestionMapper());

    public static IAttemptMapper CreateAttemptMapper() => new AttemptMapper(CreateAutoMapper(), CreateQuestionMapper());

    /// <summary>A minimal, valid QuizDto with one text question - enough to exercise save/load
    /// handlers without every test having to restate the full DTO shape.</summary>
    public static QuizDto CreateQuizDto(Guid id, string title = "Test quiz", Action<QuizSettingsDto>? configureSettings = null)
    {
        var settings = new QuizSettingsDto { IsGraded = false };
        configureSettings?.Invoke(settings);
        return new QuizDto
        {
            Id = id.ToString(),
            Title = title,
            Questions =
            [
                new TextQuestionDto { Id = Guid.NewGuid().ToString(), Prompt = "A question", Required = false },
            ],
            Settings = settings,
            CreatedAt = DateTimeOffset.UtcNow.ToString("o"),
            UpdatedAt = DateTimeOffset.UtcNow.ToString("o"),
        };
    }
}
