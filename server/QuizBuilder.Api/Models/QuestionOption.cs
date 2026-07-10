namespace QuizBuilder.Api.Models;

public class QuestionOption
{
    public Guid Id { get; set; }
    public Guid QuestionId { get; set; }
    public OptionKind Kind { get; set; } = OptionKind.Option;
    public required string Label { get; set; }
    public string? ImageUrl { get; set; }
    /// <summary>
    /// Correctness flag for choice-style questions. For word-choice/ranking, Position
    /// itself is the correct order and this stays null.
    /// </summary>
    public bool? IsCorrect { get; set; }
    public int Position { get; set; }

    public Question? Question { get; set; }
}

public class MatchingPair
{
    public Guid Id { get; set; }
    public Guid QuestionId { get; set; }
    public required string Left { get; set; }
    public required string Right { get; set; }
    public int Position { get; set; }

    public MatchingQuestion? Question { get; set; }
}

public class HotspotRegion
{
    public Guid Id { get; set; }
    public Guid QuestionId { get; set; }
    public decimal X { get; set; }
    public decimal Y { get; set; }
    public decimal Width { get; set; }
    public decimal Height { get; set; }

    public HotspotQuestion? Question { get; set; }
}

public class FillBlankAnswer
{
    public Guid Id { get; set; }
    public Guid QuestionId { get; set; }
    public int Position { get; set; }
    public string? Answer { get; set; }

    public FillInTheBlankQuestion? Question { get; set; }
}
