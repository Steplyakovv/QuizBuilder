using System.Text.Json.Serialization;
using QuizBuilder.Api.Dto.Converters;

namespace QuizBuilder.Api.Dto;

public record OptionDto
{
    public required string Id { get; init; }
    public required string Label { get; init; }
    public string? ImageUrl { get; init; }
}

public record QuestionConditionDto
{
    public required string QuestionId { get; init; }
}

/// <summary>
/// Mirrors the TS discriminated union in quiz.models.ts (Question). "type" is the discriminator.
/// Uses a custom converter (QuestionDtoConverter) rather than the built-in [JsonPolymorphic]
/// attribute: the built-in one requires "type" to be the first JSON property, which Angular's
/// serialized objects don't guarantee.
/// </summary>
[JsonConverter(typeof(QuestionDtoConverter))]
public abstract record QuestionDto
{
    public required string Id { get; init; }
    public required string Prompt { get; init; }
    public bool Required { get; init; }
    public QuestionConditionDto? Condition { get; init; }
    public string? PageId { get; init; }
}

public record SingleChoiceQuestionDto : QuestionDto
{
    public required List<OptionDto> Options { get; init; }
    public string? CorrectOptionId { get; init; }
}

public record MultipleChoiceQuestionDto : QuestionDto
{
    public required List<OptionDto> Options { get; init; }
    public List<string>? CorrectOptionIds { get; init; }
}

public record TextQuestionDto : QuestionDto
{
    public bool Multiline { get; init; }
    public int? MaxLength { get; init; }
}

public record ImageChoiceQuestionDto : QuestionDto
{
    public bool Multiple { get; init; }
    public required List<OptionDto> Options { get; init; }
    public List<string>? CorrectOptionIds { get; init; }
}

public record ImageGridQuestionDto : QuestionDto
{
    public int Columns { get; init; }
    public required List<OptionDto> Options { get; init; }
    public List<string>? CorrectOptionIds { get; init; }
}

public record TrueFalseQuestionDto : QuestionDto
{
    public bool? CorrectAnswer { get; init; }
}

public record DropdownQuestionDto : QuestionDto
{
    public required List<OptionDto> Options { get; init; }
    public string? CorrectOptionId { get; init; }
}

public record NumberQuestionDto : QuestionDto
{
    public decimal? Min { get; init; }
    public decimal? Max { get; init; }
}

public record DateQuestionDto : QuestionDto;

public record RatingQuestionDto : QuestionDto
{
    public int Min { get; init; }
    public int Max { get; init; }
}

public record SliderQuestionDto : QuestionDto
{
    public int Min { get; init; }
    public int Max { get; init; }
    public int Step { get; init; }
}

public record ConstantSumQuestionDto : QuestionDto
{
    public required List<OptionDto> Options { get; init; }
    public int Total { get; init; }
}

public record WordChoiceQuestionDto : QuestionDto
{
    public required List<OptionDto> Words { get; init; }
}

public record FillInTheBlankQuestionDto : QuestionDto
{
    public required string Template { get; init; }
    public List<string?>? CorrectAnswers { get; init; }
}

public record RankingQuestionDto : QuestionDto
{
    public required List<OptionDto> Options { get; init; }
}

public record MatchingPairDto
{
    public required string Id { get; init; }
    public required string Left { get; init; }
    public required string Right { get; init; }
}

public record MatchingQuestionDto : QuestionDto
{
    public required List<MatchingPairDto> Pairs { get; init; }
}

public record MatrixQuestionDto : QuestionDto
{
    public required List<OptionDto> Rows { get; init; }
    public required List<OptionDto> Columns { get; init; }
}

public record HotspotRegionDto
{
    public required string Id { get; init; }
    public decimal X { get; init; }
    public decimal Y { get; init; }
    public decimal Width { get; init; }
    public decimal Height { get; init; }
}

public record HotspotQuestionDto : QuestionDto
{
    public required string ImageUrl { get; init; }
    public required List<HotspotRegionDto> Regions { get; init; }
    public string? CorrectRegionId { get; init; }
}

public record FileUploadQuestionDto : QuestionDto;

public record PuzzleQuestionDto : QuestionDto
{
    public required string ImageUrl { get; init; }
    public int PieceCount { get; init; }
}

public record PuzzleHolesQuestionDto : QuestionDto
{
    public required string ImageUrl { get; init; }
    public int PieceCount { get; init; }
    public int HoleCount { get; init; }
}
