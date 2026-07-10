namespace QuizBuilder.Api.Models;

/// <summary>
/// Table-per-hierarchy base for all question types (discriminator = "Type" in
/// QuizBuilderDbContext). Type-specific columns live on the derived classes and
/// are nullable in the shared "questions" table for rows of other types.
/// </summary>
public abstract class Question
{
    public Guid Id { get; set; }
    public Guid QuizId { get; set; }
    public Guid? PageId { get; set; }
    /// <summary>This question is only shown once the referenced question has been answered.</summary>
    public Guid? ConditionQuestionId { get; set; }
    public required string Prompt { get; set; }
    public bool Required { get; set; }
    public int Position { get; set; }

    public Quiz? Quiz { get; set; }
    public List<QuestionOption> Options { get; set; } = [];
}

public class SingleChoiceQuestion : Question
{
    public Guid? CorrectOptionId { get; set; }
}

public class MultipleChoiceQuestion : Question
{
    // Correct options are QuestionOption rows with IsCorrect = true.
}

public class TextQuestion : Question
{
    public bool Multiline { get; set; }
    public int? MaxLength { get; set; }
}

public class ImageChoiceQuestion : Question
{
    public bool Multiple { get; set; }
}

public class TrueFalseQuestion : Question
{
    public bool? CorrectAnswer { get; set; }
}

public class DropdownQuestion : Question
{
    public Guid? CorrectOptionId { get; set; }
}

public class NumberQuestion : Question
{
    public decimal? Min { get; set; }
    public decimal? Max { get; set; }
}

public class DateQuestion : Question
{
}

public class RatingQuestion : Question
{
    public int Min { get; set; }
    public int Max { get; set; }
}

public class SliderQuestion : Question
{
    public int Min { get; set; }
    public int Max { get; set; }
    public int Step { get; set; }
}

public class ConstantSumQuestion : Question
{
    public int Total { get; set; }
}

/// <summary>Options.Position holds the correct sentence order; the respondent sees them shuffled.</summary>
public class WordChoiceQuestion : Question
{
}

public class FillInTheBlankQuestion : Question
{
    /// <summary>Blanks are marked with "{{}}", e.g. "Небо {{}} цвета."</summary>
    public required string Template { get; set; }

    public List<FillBlankAnswer> Answers { get; set; } = [];
}

/// <summary>Options.Position holds the correct ranking; the respondent sees them shuffled.</summary>
public class RankingQuestion : Question
{
}

public class MatchingQuestion : Question
{
    public List<MatchingPair> Pairs { get; set; } = [];
}

/// <summary>Options with Kind=Row/Column together form the matrix's axes.</summary>
public class MatrixQuestion : Question
{
}

public class HotspotQuestion : Question
{
    public required string ImageUrl { get; set; }
    public Guid? CorrectRegionId { get; set; }

    public List<HotspotRegion> Regions { get; set; } = [];
}

public class FileUploadQuestion : Question
{
}
