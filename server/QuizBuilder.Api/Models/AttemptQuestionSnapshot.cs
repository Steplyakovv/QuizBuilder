namespace QuizBuilder.Api.Models;

/// <summary>
/// Immutable copy of a Question row (and its children) taken when an attempt was
/// submitted. Flat rather than TPH-inherited like Question, since snapshots are only
/// ever read back, never edited or queried polymorphically.
/// </summary>
public class AttemptQuestionSnapshot
{
    public Guid Id { get; set; }
    public Guid AttemptId { get; set; }
    /// <summary>Question.Id at the time of the attempt; used to match against QuestionResponse.QuestionId.</summary>
    public Guid OriginalQuestionId { get; set; }
    public required string Type { get; set; }
    public required string Prompt { get; set; }
    public bool Required { get; set; }
    public int Position { get; set; }
    /// <summary>Mirrors Question.ConditionQuestionId (by original id) — needed to replay skip-logic when re-scoring.</summary>
    public Guid? ConditionQuestionId { get; set; }

    public bool? Multiline { get; set; }
    public int? MaxLength { get; set; }
    public bool? Multiple { get; set; }
    public int? Columns { get; set; }
    public int? PieceCount { get; set; }
    public int? HoleCount { get; set; }
    public bool? CorrectAnswer { get; set; }
    public Guid? CorrectOptionId { get; set; }
    public decimal? Min { get; set; }
    public decimal? Max { get; set; }
    public int? Step { get; set; }
    public int? Total { get; set; }
    public string? Template { get; set; }
    public string? ImageUrl { get; set; }
    public Guid? CorrectRegionId { get; set; }

    public QuizAttempt? Attempt { get; set; }
    public List<AttemptOptionSnapshot> Options { get; set; } = [];
    public List<AttemptMatchingPairSnapshot> Pairs { get; set; } = [];
    public List<AttemptHotspotRegionSnapshot> Regions { get; set; } = [];
    public List<AttemptFillBlankAnswerSnapshot> Answers { get; set; } = [];
}

public class AttemptOptionSnapshot
{
    public Guid Id { get; set; }
    public Guid QuestionSnapshotId { get; set; }
    /// <summary>QuestionOption.Id at attempt time; matches ResponseSelectedOption/ResponseDistribution/ResponseMatch.</summary>
    public Guid OriginalOptionId { get; set; }
    public OptionKind Kind { get; set; }
    public required string Label { get; set; }
    public string? ImageUrl { get; set; }
    public bool? IsCorrect { get; set; }
    public int Position { get; set; }

    public AttemptQuestionSnapshot? QuestionSnapshot { get; set; }
}

public class AttemptMatchingPairSnapshot
{
    public Guid Id { get; set; }
    public Guid QuestionSnapshotId { get; set; }
    public Guid OriginalPairId { get; set; }
    public required string Left { get; set; }
    public required string Right { get; set; }
    public int Position { get; set; }

    public AttemptQuestionSnapshot? QuestionSnapshot { get; set; }
}

public class AttemptHotspotRegionSnapshot
{
    public Guid Id { get; set; }
    public Guid QuestionSnapshotId { get; set; }
    public Guid OriginalRegionId { get; set; }
    public decimal X { get; set; }
    public decimal Y { get; set; }
    public decimal Width { get; set; }
    public decimal Height { get; set; }

    public AttemptQuestionSnapshot? QuestionSnapshot { get; set; }
}

public class AttemptFillBlankAnswerSnapshot
{
    public Guid Id { get; set; }
    public Guid QuestionSnapshotId { get; set; }
    public int Position { get; set; }
    public string? Answer { get; set; }

    public AttemptQuestionSnapshot? QuestionSnapshot { get; set; }
}
