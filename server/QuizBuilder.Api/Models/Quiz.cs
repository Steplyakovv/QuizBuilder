namespace QuizBuilder.Api.Models;

public class Quiz
{
    public Guid Id { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }

    public bool IsGraded { get; set; }
    public bool? ShuffleQuestions { get; set; }
    public int? TimeLimitMinutes { get; set; }
    public int? MaxAttempts { get; set; }

    /// <summary>Null/true means published; matches the TS "defaults to true when unset" convention.</summary>
    public bool? Published { get; set; }
    public string? AccessPassword { get; set; }
    public DateTimeOffset? ExpiresAt { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public List<QuizPage> Pages { get; set; } = [];
    public List<Question> Questions { get; set; } = [];
    public List<QuizAttempt> Attempts { get; set; } = [];
}

public class QuizPage
{
    public Guid Id { get; set; }
    public Guid QuizId { get; set; }
    public required string Title { get; set; }
    public int Position { get; set; }

    public Quiz? Quiz { get; set; }
}
