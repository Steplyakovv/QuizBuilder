using QuizBuilder.Api.Models;

namespace QuizBuilder.Api.Mapping;

/// <summary>
/// Flat, type-erased view of a question's data. Both the live Question (TPH) entity and
/// the immutable AttemptQuestionSnapshot entity have the same shape, so conversions to/from
/// this record are shared by the "live" and "snapshot" mapping paths instead of duplicating
/// an 18-branch switch four times over.
/// </summary>
public sealed record QuestionFieldValues
{
    public required Guid Id { get; init; }
    public required string Type { get; init; }
    public required string Prompt { get; init; }
    public required bool Required { get; init; }
    public Guid? ConditionQuestionId { get; init; }
    public Guid? PageId { get; init; }
    public required int Position { get; init; }

    public List<OptionFieldValues> Options { get; init; } = [];
    public List<PairFieldValues> Pairs { get; init; } = [];
    public List<RegionFieldValues> Regions { get; init; } = [];
    public List<AnswerFieldValues> Answers { get; init; } = [];

    public bool? Multiline { get; init; }
    public int? MaxLength { get; init; }
    public bool? Multiple { get; init; }
    public int? Columns { get; init; }
    public bool? CorrectAnswer { get; init; }
    public Guid? CorrectOptionId { get; init; }
    public decimal? Min { get; init; }
    public decimal? Max { get; init; }
    public int? Step { get; init; }
    public int? Total { get; init; }
    public string? Template { get; init; }
    public string? ImageUrl { get; init; }
    public Guid? CorrectRegionId { get; init; }
}

public sealed record OptionFieldValues(Guid Id, OptionKind Kind, string Label, string? ImageUrl, bool? IsCorrect, int Position);

public sealed record PairFieldValues(Guid Id, string Left, string Right, int Position);

public sealed record RegionFieldValues(Guid Id, decimal X, decimal Y, decimal Width, decimal Height);

public sealed record AnswerFieldValues(int Position, string? Answer);
