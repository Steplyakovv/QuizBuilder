namespace QuizBuilder.Api.Dto;

public record QuizPageDto
{
    public required string Id { get; init; }
    public required string Title { get; init; }
}

public record QuizSettingsDto
{
    public bool IsGraded { get; init; }
    public bool? ShuffleQuestions { get; init; }
    public int? TimeLimitMinutes { get; init; }
    public int? MaxAttempts { get; init; }
    public bool? Published { get; init; }
    public string? AccessPassword { get; init; }
    public string? ExpiresAt { get; init; }
}

public record QuizDto
{
    public required string Id { get; init; }
    public required string Title { get; init; }
    public string? Description { get; init; }
    public required List<QuestionDto> Questions { get; init; }
    public List<QuizPageDto>? Pages { get; init; }
    public required QuizSettingsDto Settings { get; init; }
    public required string CreatedAt { get; init; }
    public required string UpdatedAt { get; init; }
}
