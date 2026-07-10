using QuizBuilder.Api.Dto;
using QuizBuilder.Api.Models;

namespace QuizBuilder.Api.Mapping;

public static class QuestionMapper
{
    // ---- entity/snapshot -> field values -------------------------------------------------

    public static QuestionFieldValues FromEntity(Question q) => new()
    {
        Id = q.Id,
        Type = QuestionTypeOf(q),
        Prompt = q.Prompt,
        Required = q.Required,
        ConditionQuestionId = q.ConditionQuestionId,
        PageId = q.PageId,
        Position = q.Position,
        Options = q.Options.Select(o => new OptionFieldValues(o.Id, o.Kind, o.Label, o.ImageUrl, o.IsCorrect, o.Position)).ToList(),
        Pairs = q is MatchingQuestion m ? m.Pairs.Select(p => new PairFieldValues(p.Id, p.Left, p.Right, p.Position)).ToList() : [],
        Regions = q is HotspotQuestion h ? h.Regions.Select(r => new RegionFieldValues(r.Id, r.X, r.Y, r.Width, r.Height)).ToList() : [],
        Answers = q is FillInTheBlankQuestion f ? f.Answers.Select(a => new AnswerFieldValues(a.Position, a.Answer)).ToList() : [],
        Multiline = (q as TextQuestion)?.Multiline,
        MaxLength = (q as TextQuestion)?.MaxLength,
        Multiple = (q as ImageChoiceQuestion)?.Multiple,
        CorrectAnswer = (q as TrueFalseQuestion)?.CorrectAnswer,
        CorrectOptionId = q switch
        {
            SingleChoiceQuestion s => s.CorrectOptionId,
            DropdownQuestion d => d.CorrectOptionId,
            _ => null,
        },
        Min = q switch
        {
            NumberQuestion n => n.Min,
            RatingQuestion r => r.Min,
            SliderQuestion sl => sl.Min,
            _ => null,
        },
        Max = q switch
        {
            NumberQuestion n => n.Max,
            RatingQuestion r => r.Max,
            SliderQuestion sl => sl.Max,
            _ => null,
        },
        Step = (q as SliderQuestion)?.Step,
        Total = (q as ConstantSumQuestion)?.Total,
        Template = (q as FillInTheBlankQuestion)?.Template,
        ImageUrl = (q as HotspotQuestion)?.ImageUrl,
        CorrectRegionId = (q as HotspotQuestion)?.CorrectRegionId,
    };

    public static QuestionFieldValues FromSnapshot(AttemptQuestionSnapshot s) => new()
    {
        Id = s.OriginalQuestionId,
        Type = s.Type,
        Prompt = s.Prompt,
        Required = s.Required,
        ConditionQuestionId = s.ConditionQuestionId,
        PageId = null,
        Position = s.Position,
        Options = s.Options.Select(o => new OptionFieldValues(o.OriginalOptionId, o.Kind, o.Label, o.ImageUrl, o.IsCorrect, o.Position)).ToList(),
        Pairs = s.Pairs.Select(p => new PairFieldValues(p.OriginalPairId, p.Left, p.Right, p.Position)).ToList(),
        Regions = s.Regions.Select(r => new RegionFieldValues(r.OriginalRegionId, r.X, r.Y, r.Width, r.Height)).ToList(),
        Answers = s.Answers.Select(a => new AnswerFieldValues(a.Position, a.Answer)).ToList(),
        Multiline = s.Multiline,
        MaxLength = s.MaxLength,
        Multiple = s.Multiple,
        CorrectAnswer = s.CorrectAnswer,
        CorrectOptionId = s.CorrectOptionId,
        Min = s.Min,
        Max = s.Max,
        Step = s.Step,
        Total = s.Total,
        Template = s.Template,
        ImageUrl = s.ImageUrl,
        CorrectRegionId = s.CorrectRegionId,
    };

    private static string QuestionTypeOf(Question q) => q switch
    {
        SingleChoiceQuestion => "single-choice",
        MultipleChoiceQuestion => "multiple-choice",
        TextQuestion => "text",
        ImageChoiceQuestion => "image-choice",
        TrueFalseQuestion => "true-false",
        DropdownQuestion => "dropdown",
        NumberQuestion => "number",
        DateQuestion => "date",
        RatingQuestion => "rating",
        SliderQuestion => "slider",
        ConstantSumQuestion => "constant-sum",
        WordChoiceQuestion => "word-choice",
        FillInTheBlankQuestion => "fill-in-the-blank",
        RankingQuestion => "ranking",
        MatchingQuestion => "matching",
        MatrixQuestion => "matrix",
        HotspotQuestion => "hotspot",
        FileUploadQuestion => "file-upload",
        _ => throw new NotSupportedException($"Unknown question entity type {q.GetType()}"),
    };

    // ---- dto -> field values ---------------------------------------------------------------

    public static QuestionFieldValues FromDto(QuestionDto dto, int position)
    {
        var options = OptionsOf(dto);
        return new QuestionFieldValues
        {
            Id = Guid.Parse(dto.Id),
            Type = TypeStringOf(dto),
            Prompt = dto.Prompt,
            Required = dto.Required,
            ConditionQuestionId = dto.Condition is null ? null : Guid.Parse(dto.Condition.QuestionId),
            PageId = dto.PageId is null ? null : Guid.Parse(dto.PageId),
            Position = position,
            Options = options,
            Pairs = dto is MatchingQuestionDto matching
                ? matching.Pairs.Select((p, i) => new PairFieldValues(Guid.Parse(p.Id), p.Left, p.Right, i)).ToList()
                : [],
            Regions = dto is HotspotQuestionDto hotspot
                ? hotspot.Regions.Select(r => new RegionFieldValues(Guid.Parse(r.Id), r.X, r.Y, r.Width, r.Height)).ToList()
                : [],
            Answers = dto is FillInTheBlankQuestionDto fitb && fitb.CorrectAnswers is not null
                ? fitb.CorrectAnswers.Select((a, i) => new AnswerFieldValues(i, a)).ToList()
                : [],
            Multiline = (dto as TextQuestionDto)?.Multiline,
            MaxLength = (dto as TextQuestionDto)?.MaxLength,
            Multiple = dto switch
            {
                ImageChoiceQuestionDto ic => ic.Multiple,
                _ => null,
            },
            CorrectAnswer = (dto as TrueFalseQuestionDto)?.CorrectAnswer,
            CorrectOptionId = dto switch
            {
                SingleChoiceQuestionDto s => s.CorrectOptionId is null ? null : Guid.Parse(s.CorrectOptionId),
                DropdownQuestionDto d => d.CorrectOptionId is null ? null : Guid.Parse(d.CorrectOptionId),
                _ => null,
            },
            Min = dto switch
            {
                NumberQuestionDto n => n.Min,
                RatingQuestionDto r => r.Min,
                SliderQuestionDto sl => sl.Min,
                _ => (decimal?)null,
            },
            Max = dto switch
            {
                NumberQuestionDto n => n.Max,
                RatingQuestionDto r => r.Max,
                SliderQuestionDto sl => sl.Max,
                _ => (decimal?)null,
            },
            Step = (dto as SliderQuestionDto)?.Step,
            Total = (dto as ConstantSumQuestionDto)?.Total,
            Template = (dto as FillInTheBlankQuestionDto)?.Template,
            ImageUrl = (dto as HotspotQuestionDto)?.ImageUrl,
            CorrectRegionId = dto is HotspotQuestionDto h && h.CorrectRegionId is not null ? Guid.Parse(h.CorrectRegionId) : null,
        };
    }

    private static List<OptionFieldValues> OptionsOf(QuestionDto dto)
    {
        static List<OptionFieldValues> Map(IEnumerable<OptionDto> options, OptionKind kind, HashSet<string>? correctIds = null) =>
            options.Select((o, i) => new OptionFieldValues(
                Guid.Parse(o.Id), kind, o.Label, o.ImageUrl,
                correctIds is null ? null : correctIds.Contains(o.Id), i)).ToList();

        return dto switch
        {
            SingleChoiceQuestionDto s => Map(s.Options, OptionKind.Option, s.CorrectOptionId is null ? [] : [s.CorrectOptionId]),
            MultipleChoiceQuestionDto m => Map(m.Options, OptionKind.Option, m.CorrectOptionIds is null ? [] : [.. m.CorrectOptionIds]),
            ImageChoiceQuestionDto i => Map(i.Options, OptionKind.Option, i.CorrectOptionIds is null ? [] : [.. i.CorrectOptionIds]),
            DropdownQuestionDto d => Map(d.Options, OptionKind.Option, d.CorrectOptionId is null ? [] : [d.CorrectOptionId]),
            ConstantSumQuestionDto c => Map(c.Options, OptionKind.Option),
            WordChoiceQuestionDto w => Map(w.Words, OptionKind.Option),
            RankingQuestionDto r => Map(r.Options, OptionKind.Option),
            MatrixQuestionDto mx => [.. Map(mx.Rows, OptionKind.Row), .. Map(mx.Columns, OptionKind.Column)],
            _ => [],
        };
    }

    private static string TypeStringOf(QuestionDto dto) => dto switch
    {
        SingleChoiceQuestionDto => "single-choice",
        MultipleChoiceQuestionDto => "multiple-choice",
        TextQuestionDto => "text",
        ImageChoiceQuestionDto => "image-choice",
        TrueFalseQuestionDto => "true-false",
        DropdownQuestionDto => "dropdown",
        NumberQuestionDto => "number",
        DateQuestionDto => "date",
        RatingQuestionDto => "rating",
        SliderQuestionDto => "slider",
        ConstantSumQuestionDto => "constant-sum",
        WordChoiceQuestionDto => "word-choice",
        FillInTheBlankQuestionDto => "fill-in-the-blank",
        RankingQuestionDto => "ranking",
        MatchingQuestionDto => "matching",
        MatrixQuestionDto => "matrix",
        HotspotQuestionDto => "hotspot",
        FileUploadQuestionDto => "file-upload",
        _ => throw new NotSupportedException($"Unknown question dto type {dto.GetType()}"),
    };

    // ---- field values -> dto ---------------------------------------------------------------

    public static QuestionDto ToDto(QuestionFieldValues v)
    {
        string id = v.Id.ToString();
        QuestionConditionDto? condition = v.ConditionQuestionId is { } cq ? new QuestionConditionDto { QuestionId = cq.ToString() } : null;
        string? pageId = v.PageId?.ToString();
        List<OptionDto> optionDtos = v.Options.OrderBy(o => o.Position)
            .Select(o => new OptionDto { Id = o.Id.ToString(), Label = o.Label, ImageUrl = o.ImageUrl })
            .ToList();

        return v.Type switch
        {
            "single-choice" => new SingleChoiceQuestionDto
            {
                Id = id, Prompt = v.Prompt, Required = v.Required, Condition = condition, PageId = pageId,
                Options = optionDtos, CorrectOptionId = v.CorrectOptionId?.ToString(),
            },
            "multiple-choice" => new MultipleChoiceQuestionDto
            {
                Id = id, Prompt = v.Prompt, Required = v.Required, Condition = condition, PageId = pageId,
                Options = optionDtos, CorrectOptionIds = CorrectOptionIds(v),
            },
            "text" => new TextQuestionDto
            {
                Id = id, Prompt = v.Prompt, Required = v.Required, Condition = condition, PageId = pageId,
                Multiline = v.Multiline ?? false, MaxLength = v.MaxLength,
            },
            "image-choice" => new ImageChoiceQuestionDto
            {
                Id = id, Prompt = v.Prompt, Required = v.Required, Condition = condition, PageId = pageId,
                Multiple = v.Multiple ?? false, Options = optionDtos, CorrectOptionIds = CorrectOptionIds(v),
            },
            "true-false" => new TrueFalseQuestionDto
            {
                Id = id, Prompt = v.Prompt, Required = v.Required, Condition = condition, PageId = pageId,
                CorrectAnswer = v.CorrectAnswer,
            },
            "dropdown" => new DropdownQuestionDto
            {
                Id = id, Prompt = v.Prompt, Required = v.Required, Condition = condition, PageId = pageId,
                Options = optionDtos, CorrectOptionId = v.CorrectOptionId?.ToString(),
            },
            "number" => new NumberQuestionDto
            {
                Id = id, Prompt = v.Prompt, Required = v.Required, Condition = condition, PageId = pageId,
                Min = v.Min, Max = v.Max,
            },
            "date" => new DateQuestionDto
            {
                Id = id, Prompt = v.Prompt, Required = v.Required, Condition = condition, PageId = pageId,
            },
            "rating" => new RatingQuestionDto
            {
                Id = id, Prompt = v.Prompt, Required = v.Required, Condition = condition, PageId = pageId,
                Min = (int)(v.Min ?? 0), Max = (int)(v.Max ?? 0),
            },
            "slider" => new SliderQuestionDto
            {
                Id = id, Prompt = v.Prompt, Required = v.Required, Condition = condition, PageId = pageId,
                Min = (int)(v.Min ?? 0), Max = (int)(v.Max ?? 0), Step = v.Step ?? 1,
            },
            "constant-sum" => new ConstantSumQuestionDto
            {
                Id = id, Prompt = v.Prompt, Required = v.Required, Condition = condition, PageId = pageId,
                Options = optionDtos, Total = v.Total ?? 0,
            },
            "word-choice" => new WordChoiceQuestionDto
            {
                Id = id, Prompt = v.Prompt, Required = v.Required, Condition = condition, PageId = pageId,
                Words = optionDtos,
            },
            "fill-in-the-blank" => new FillInTheBlankQuestionDto
            {
                Id = id, Prompt = v.Prompt, Required = v.Required, Condition = condition, PageId = pageId,
                Template = v.Template ?? "",
                CorrectAnswers = v.Answers.Count == 0 ? null : v.Answers.OrderBy(a => a.Position).Select(a => a.Answer).ToList(),
            },
            "ranking" => new RankingQuestionDto
            {
                Id = id, Prompt = v.Prompt, Required = v.Required, Condition = condition, PageId = pageId,
                Options = optionDtos,
            },
            "matching" => new MatchingQuestionDto
            {
                Id = id, Prompt = v.Prompt, Required = v.Required, Condition = condition, PageId = pageId,
                Pairs = v.Pairs.OrderBy(p => p.Position)
                    .Select(p => new MatchingPairDto { Id = p.Id.ToString(), Left = p.Left, Right = p.Right }).ToList(),
            },
            "matrix" => new MatrixQuestionDto
            {
                Id = id, Prompt = v.Prompt, Required = v.Required, Condition = condition, PageId = pageId,
                Rows = v.Options.Where(o => o.Kind == OptionKind.Row).OrderBy(o => o.Position)
                    .Select(o => new OptionDto { Id = o.Id.ToString(), Label = o.Label, ImageUrl = o.ImageUrl }).ToList(),
                Columns = v.Options.Where(o => o.Kind == OptionKind.Column).OrderBy(o => o.Position)
                    .Select(o => new OptionDto { Id = o.Id.ToString(), Label = o.Label, ImageUrl = o.ImageUrl }).ToList(),
            },
            "hotspot" => new HotspotQuestionDto
            {
                Id = id, Prompt = v.Prompt, Required = v.Required, Condition = condition, PageId = pageId,
                ImageUrl = v.ImageUrl ?? "",
                Regions = v.Regions.Select(r => new HotspotRegionDto { Id = r.Id.ToString(), X = r.X, Y = r.Y, Width = r.Width, Height = r.Height }).ToList(),
                CorrectRegionId = v.CorrectRegionId?.ToString(),
            },
            "file-upload" => new FileUploadQuestionDto
            {
                Id = id, Prompt = v.Prompt, Required = v.Required, Condition = condition, PageId = pageId,
            },
            _ => throw new NotSupportedException($"Unknown question type '{v.Type}'"),
        };
    }

    private static List<string>? CorrectOptionIds(QuestionFieldValues v)
    {
        var correct = v.Options.Where(o => o.IsCorrect == true).Select(o => o.Id.ToString()).ToList();
        return correct.Count == 0 ? null : correct;
    }

    // ---- field values -> entity / snapshot entity ------------------------------------------

    public static Question ToEntity(QuestionFieldValues v, Guid quizId)
    {
        Question question = v.Type switch
        {
            "single-choice" => new SingleChoiceQuestion { CorrectOptionId = v.CorrectOptionId, Prompt = v.Prompt },
            "multiple-choice" => new MultipleChoiceQuestion { Prompt = v.Prompt },
            "text" => new TextQuestion { Multiline = v.Multiline ?? false, MaxLength = v.MaxLength, Prompt = v.Prompt },
            "image-choice" => new ImageChoiceQuestion { Multiple = v.Multiple ?? false, Prompt = v.Prompt },
            "true-false" => new TrueFalseQuestion { CorrectAnswer = v.CorrectAnswer, Prompt = v.Prompt },
            "dropdown" => new DropdownQuestion { CorrectOptionId = v.CorrectOptionId, Prompt = v.Prompt },
            "number" => new NumberQuestion { Min = v.Min, Max = v.Max, Prompt = v.Prompt },
            "date" => new DateQuestion { Prompt = v.Prompt },
            "rating" => new RatingQuestion { Min = (int)(v.Min ?? 0), Max = (int)(v.Max ?? 0), Prompt = v.Prompt },
            "slider" => new SliderQuestion { Min = (int)(v.Min ?? 0), Max = (int)(v.Max ?? 0), Step = v.Step ?? 1, Prompt = v.Prompt },
            "constant-sum" => new ConstantSumQuestion { Total = v.Total ?? 0, Prompt = v.Prompt },
            "word-choice" => new WordChoiceQuestion { Prompt = v.Prompt },
            "fill-in-the-blank" => new FillInTheBlankQuestion
            {
                Template = v.Template ?? "",
                Prompt = v.Prompt,
                Answers = v.Answers.Select(a => new FillBlankAnswer { Id = Guid.NewGuid(), Position = a.Position, Answer = a.Answer }).ToList(),
            },
            "ranking" => new RankingQuestion { Prompt = v.Prompt },
            "matching" => new MatchingQuestion
            {
                Prompt = v.Prompt,
                Pairs = v.Pairs.Select(p => new MatchingPair { Id = p.Id, Left = p.Left, Right = p.Right, Position = p.Position }).ToList(),
            },
            "matrix" => new MatrixQuestion { Prompt = v.Prompt },
            "hotspot" => new HotspotQuestion
            {
                ImageUrl = v.ImageUrl ?? "",
                CorrectRegionId = v.CorrectRegionId,
                Prompt = v.Prompt,
                Regions = v.Regions.Select(r => new HotspotRegion { Id = r.Id, X = r.X, Y = r.Y, Width = r.Width, Height = r.Height }).ToList(),
            },
            "file-upload" => new FileUploadQuestion { Prompt = v.Prompt },
            _ => throw new NotSupportedException($"Unknown question type '{v.Type}'"),
        };

        question.Id = v.Id;
        question.QuizId = quizId;
        question.Required = v.Required;
        question.ConditionQuestionId = v.ConditionQuestionId;
        question.PageId = v.PageId;
        question.Position = v.Position;
        question.Options = v.Options.Select(o => new QuestionOption
        {
            Id = o.Id, Kind = o.Kind, Label = o.Label, ImageUrl = o.ImageUrl, IsCorrect = o.IsCorrect, Position = o.Position,
        }).ToList();

        return question;
    }

    public static AttemptQuestionSnapshot ToSnapshotEntity(QuestionFieldValues v, Guid attemptId) => new()
    {
        Id = Guid.NewGuid(),
        AttemptId = attemptId,
        OriginalQuestionId = v.Id,
        Type = v.Type,
        Prompt = v.Prompt,
        Required = v.Required,
        Position = v.Position,
        ConditionQuestionId = v.ConditionQuestionId,
        Multiline = v.Multiline,
        MaxLength = v.MaxLength,
        Multiple = v.Multiple,
        CorrectAnswer = v.CorrectAnswer,
        CorrectOptionId = v.CorrectOptionId,
        Min = v.Min,
        Max = v.Max,
        Step = v.Step,
        Total = v.Total,
        Template = v.Template,
        ImageUrl = v.ImageUrl,
        CorrectRegionId = v.CorrectRegionId,
        Options = v.Options.Select(o => new AttemptOptionSnapshot
        {
            Id = Guid.NewGuid(), OriginalOptionId = o.Id, Kind = o.Kind, Label = o.Label, ImageUrl = o.ImageUrl, IsCorrect = o.IsCorrect, Position = o.Position,
        }).ToList(),
        Pairs = v.Pairs.Select(p => new AttemptMatchingPairSnapshot
        {
            Id = Guid.NewGuid(), OriginalPairId = p.Id, Left = p.Left, Right = p.Right, Position = p.Position,
        }).ToList(),
        Regions = v.Regions.Select(r => new AttemptHotspotRegionSnapshot
        {
            Id = Guid.NewGuid(), OriginalRegionId = r.Id, X = r.X, Y = r.Y, Width = r.Width, Height = r.Height,
        }).ToList(),
        Answers = v.Answers.Select(a => new AttemptFillBlankAnswerSnapshot
        {
            Id = Guid.NewGuid(), Position = a.Position, Answer = a.Answer,
        }).ToList(),
    };
}
