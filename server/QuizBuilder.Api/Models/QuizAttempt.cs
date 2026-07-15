namespace QuizBuilder.Api.Models;

public class QuizAttempt
{
    public Guid Id { get; set; }
    public Guid QuizId { get; set; }
    public string? RespondentName { get; set; }
    /// <summary>Per-browser id used to enforce Quiz.MaxAttempts; not a real identity.</summary>
    public string? RespondentClientId { get; set; }
    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public int? Score { get; set; }
    /// <summary>
    /// Quiz.IsGraded at submit time, alongside QuestionSnapshots — null when no snapshot was
    /// taken (attempts saved before this feature existed fall back to the live quiz).
    /// </summary>
    public bool? SnapshotIsGraded { get; set; }

    public Quiz? Quiz { get; set; }
    public List<QuestionResponse> Responses { get; set; } = [];

    /// <summary>
    /// Point-in-time copy of the questions this respondent actually saw, captured at
    /// submit time, so later edits to the live quiz don't change old results.
    /// </summary>
    public List<AttemptQuestionSnapshot> QuestionSnapshots { get; set; } = [];
}

public class QuestionResponse
{
    public Guid Id { get; set; }
    public Guid AttemptId { get; set; }
    /// <summary>
    /// Not a foreign key: the live Question row may be deleted after this response was
    /// recorded, and the response must still display via the attempt's own snapshot.
    /// </summary>
    public Guid QuestionId { get; set; }
    public string? Text { get; set; }
    public QuizAttempt? Attempt { get; set; }

    public List<ResponseSelectedOption> SelectedOptions { get; set; } = [];
    public List<ResponseDistribution> Distributions { get; set; } = [];
    public List<ResponseBlank> Blanks { get; set; } = [];
    public List<ResponseMatch> Matches { get; set; } = [];
    public ResponseFile? File { get; set; }
    public List<ResponsePuzzlePlacement> PuzzlePlacements { get; set; } = [];
}

public class ResponseSelectedOption
{
    public Guid Id { get; set; }
    public Guid ResponseId { get; set; }
    public Guid OptionId { get; set; }

    public QuestionResponse? Response { get; set; }
}

public class ResponseDistribution
{
    public Guid Id { get; set; }
    public Guid ResponseId { get; set; }
    public Guid OptionId { get; set; }
    public int Points { get; set; }

    public QuestionResponse? Response { get; set; }
}

public class ResponseBlank
{
    public Guid Id { get; set; }
    public Guid ResponseId { get; set; }
    public int Position { get; set; }
    public string? Answer { get; set; }

    public QuestionResponse? Response { get; set; }
}

/// <summary>Maps a left-pair id to a right-pair id (matching), or a row id to a column id (matrix).</summary>
public class ResponseMatch
{
    public Guid Id { get; set; }
    public Guid ResponseId { get; set; }
    public Guid KeyId { get; set; }
    public Guid ValueId { get; set; }

    public QuestionResponse? Response { get; set; }
}

/// <summary>Where a puzzle piece currently sits and how it's rotated; correct when CellIndex == PieceIndex && RotationDegrees == 0.</summary>
public class ResponsePuzzlePlacement
{
    public Guid Id { get; set; }
    public Guid ResponseId { get; set; }
    public int PieceIndex { get; set; }
    public int CellIndex { get; set; }
    public int RotationDegrees { get; set; }

    public QuestionResponse? Response { get; set; }
}

public class ResponseFile
{
    public Guid Id { get; set; }
    public Guid ResponseId { get; set; }
    public required string FileName { get; set; }
    public required string ContentType { get; set; }
    public required byte[] Content { get; set; }

    public QuestionResponse? Response { get; set; }
}
