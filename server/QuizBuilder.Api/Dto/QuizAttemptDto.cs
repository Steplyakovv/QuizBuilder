namespace QuizBuilder.Api.Dto;

public record ResponseFileDto
{
    public required string Name { get; init; }
    public required string DataUrl { get; init; }
}

public record QuestionResponseDto
{
    public required string QuestionId { get; init; }
    public List<string>? SelectedOptionIds { get; init; }
    public string? Text { get; init; }
    public Dictionary<string, int>? Distribution { get; init; }
    public List<string>? Blanks { get; init; }
    public Dictionary<string, string>? Matches { get; init; }
    public ResponseFileDto? File { get; init; }
}

public record QuizAttemptDto
{
    public required string Id { get; init; }
    public required string QuizId { get; init; }
    public string? RespondentName { get; init; }
    public string? RespondentClientId { get; init; }
    public required string StartedAt { get; init; }
    public string? CompletedAt { get; init; }
    public required List<QuestionResponseDto> Responses { get; init; }
    public int? Score { get; init; }
    /// <summary>Quiz as the respondent saw it, captured client-side at submit time.</summary>
    public QuizDto? QuizSnapshot { get; init; }
}
