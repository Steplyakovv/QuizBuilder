using QuizBuilder.Api.Dto;
using QuizBuilder.Api.Models;

namespace QuizBuilder.Api.Mapping;

public static class QuizMapper
{
    public static QuizDto ToDto(Quiz quiz) => new()
    {
        Id = quiz.Id.ToString(),
        Title = quiz.Title,
        Description = quiz.Description,
        Questions = quiz.Questions.OrderBy(q => q.Position)
            .Select(q => QuestionMapper.ToDto(QuestionMapper.FromEntity(q)))
            .ToList(),
        Pages = quiz.Pages.Count == 0
            ? null
            : quiz.Pages.OrderBy(p => p.Position).Select(p => new QuizPageDto { Id = p.Id.ToString(), Title = p.Title }).ToList(),
        Settings = new QuizSettingsDto
        {
            IsGraded = quiz.IsGraded,
            ShuffleQuestions = quiz.ShuffleQuestions,
            TimeLimitMinutes = quiz.TimeLimitMinutes,
            MaxAttempts = quiz.MaxAttempts,
            Published = quiz.Published,
            AccessPassword = quiz.AccessPassword,
            ExpiresAt = quiz.ExpiresAt?.ToString("o"),
        },
        CreatedAt = quiz.CreatedAt.ToString("o"),
        UpdatedAt = quiz.UpdatedAt.ToString("o"),
    };

    /// <summary>
    /// Applies a QuizDto's scalar fields onto an existing (or brand-new) Quiz entity.
    /// Pages/Questions are deliberately NOT touched here - see BuildPages/BuildQuestions.
    /// </summary>
    public static void ApplyScalarsTo(Quiz target, QuizDto dto)
    {
        target.Id = Guid.Parse(dto.Id);
        target.Title = dto.Title;
        target.Description = dto.Description;
        target.IsGraded = dto.Settings.IsGraded;
        target.ShuffleQuestions = dto.Settings.ShuffleQuestions;
        target.TimeLimitMinutes = dto.Settings.TimeLimitMinutes;
        target.MaxAttempts = dto.Settings.MaxAttempts;
        target.Published = dto.Settings.Published;
        target.AccessPassword = dto.Settings.AccessPassword;
        target.ExpiresAt = dto.Settings.ExpiresAt is null ? null : DateTimeOffset.Parse(dto.Settings.ExpiresAt);
        target.CreatedAt = DateTimeOffset.Parse(dto.CreatedAt);
        target.UpdatedAt = DateTimeOffset.Parse(dto.UpdatedAt);
    }

    /// <summary>
    /// Builds the quiz's pages/questions as brand-new entities to be explicitly
    /// AddRange()-d rather than assigned to an already-tracked parent's navigation
    /// property: our ids are client-generated (non-default) GUIDs, and EF Core only
    /// reliably marks such entities as "Added" (INSERT) when discovered through an
    /// explicit Add - entities picked up implicitly via a tracked navigation change are
    /// treated as pre-existing and get UPDATE statements issued against rows that don't
    /// exist yet, which fails with DbUpdateConcurrencyException (0 rows affected).
    /// </summary>
    public static (List<QuizPage> Pages, List<Question> Questions) BuildChildren(QuizDto dto, Guid quizId)
    {
        var pages = (dto.Pages ?? []).Select((p, i) => new QuizPage
        {
            Id = Guid.Parse(p.Id), QuizId = quizId, Title = p.Title, Position = i,
        }).ToList();

        var questions = dto.Questions
            .Select((q, i) => QuestionMapper.ToEntity(QuestionMapper.FromDto(q, i), quizId))
            .ToList();

        return (pages, questions);
    }
}
