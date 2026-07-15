using QuizBuilder.Api.Dto;
using QuizBuilder.Api.Mapping;
using QuizBuilder.Api.Models;

namespace QuizBuilder.Api.Tests.Mapping;

public class QuestionMapperTests
{
    private readonly IQuestionMapper mapper = new QuestionMapper();

    [Fact]
    public void Text_question_round_trips_prompt_condition_and_page()
    {
        var conditionQuestionId = Guid.NewGuid().ToString();
        var pageId = Guid.NewGuid().ToString();
        var dto = new TextQuestionDto
        {
            Id = Guid.NewGuid().ToString(),
            Prompt = "How do you feel today?",
            Required = true,
            Condition = new QuestionConditionDto { QuestionId = conditionQuestionId },
            PageId = pageId,
            Multiline = true,
            MaxLength = 280,
        };

        var result = Assert.IsType<TextQuestionDto>(mapper.ToDto(mapper.FromDto(dto, 0)));

        Assert.Equal(dto.Id, result.Id);
        Assert.Equal(dto.Prompt, result.Prompt);
        Assert.True(result.Required);
        Assert.Equal(conditionQuestionId, result.Condition?.QuestionId);
        Assert.Equal(pageId, result.PageId);
        Assert.True(result.Multiline);
        Assert.Equal(280, result.MaxLength);
    }

    [Fact]
    public void Single_choice_question_round_trips_the_correct_option_through_entity_and_back()
    {
        var optionA = new OptionDto { Id = Guid.NewGuid().ToString(), Label = "A" };
        var optionB = new OptionDto { Id = Guid.NewGuid().ToString(), Label = "B" };
        var dto = new SingleChoiceQuestionDto
        {
            Id = Guid.NewGuid().ToString(),
            Prompt = "Pick one",
            Options = [optionA, optionB],
            CorrectOptionId = optionB.Id,
        };

        var entity = Assert.IsType<SingleChoiceQuestion>(mapper.ToEntity(mapper.FromDto(dto, 0), Guid.NewGuid()));
        Assert.Equal(Guid.Parse(optionB.Id), entity.CorrectOptionId);
        Assert.True(entity.Options.Single(o => o.Id == Guid.Parse(optionB.Id)).IsCorrect);
        Assert.False(entity.Options.Single(o => o.Id == Guid.Parse(optionA.Id)).IsCorrect);

        var result = Assert.IsType<SingleChoiceQuestionDto>(mapper.ToDto(mapper.FromEntity(entity)));
        Assert.Equal(optionB.Id, result.CorrectOptionId);
        Assert.Equal([optionA.Id, optionB.Id], result.Options.Select(o => o.Id));
    }

    [Fact]
    public void Dropdown_question_round_trips_the_correct_option_id()
    {
        var option = new OptionDto { Id = Guid.NewGuid().ToString(), Label = "Only option" };
        var dto = new DropdownQuestionDto
        {
            Id = Guid.NewGuid().ToString(),
            Prompt = "Choose",
            Options = [option],
            CorrectOptionId = option.Id,
        };

        var result = Assert.IsType<DropdownQuestionDto>(mapper.ToDto(mapper.FromDto(dto, 0)));

        Assert.Equal(option.Id, result.CorrectOptionId);
    }

    [Fact]
    public void Multiple_choice_question_round_trips_several_correct_options_in_order()
    {
        var optionA = new OptionDto { Id = Guid.NewGuid().ToString(), Label = "A" };
        var optionB = new OptionDto { Id = Guid.NewGuid().ToString(), Label = "B" };
        var optionC = new OptionDto { Id = Guid.NewGuid().ToString(), Label = "C" };
        var dto = new MultipleChoiceQuestionDto
        {
            Id = Guid.NewGuid().ToString(),
            Prompt = "Pick several",
            Options = [optionA, optionB, optionC],
            CorrectOptionIds = [optionA.Id, optionC.Id],
        };

        var result = Assert.IsType<MultipleChoiceQuestionDto>(mapper.ToDto(mapper.FromDto(dto, 0)));

        Assert.Equal([optionA.Id, optionC.Id], result.CorrectOptionIds);
    }

    [Fact]
    public void Matrix_question_splits_and_rejoins_rows_and_columns_by_kind()
    {
        var row1 = new OptionDto { Id = Guid.NewGuid().ToString(), Label = "Row 1" };
        var row2 = new OptionDto { Id = Guid.NewGuid().ToString(), Label = "Row 2" };
        var col1 = new OptionDto { Id = Guid.NewGuid().ToString(), Label = "Col 1" };
        var dto = new MatrixQuestionDto
        {
            Id = Guid.NewGuid().ToString(),
            Prompt = "Rate each row",
            Rows = [row1, row2],
            Columns = [col1],
        };

        var fieldValues = mapper.FromDto(dto, 0);
        // Rows and columns are collapsed into one Options list, told apart by Kind.
        Assert.Equal(2, fieldValues.Options.Count(o => o.Kind == OptionKind.Row));
        Assert.Equal(1, fieldValues.Options.Count(o => o.Kind == OptionKind.Column));

        var result = Assert.IsType<MatrixQuestionDto>(mapper.ToDto(fieldValues));

        Assert.Equal([row1.Id, row2.Id], result.Rows.Select(o => o.Id));
        Assert.Equal([col1.Id], result.Columns.Select(o => o.Id));
    }

    [Fact]
    public void Matching_question_round_trips_pairs_through_the_snapshot_shape_too()
    {
        var dto = new MatchingQuestionDto
        {
            Id = Guid.NewGuid().ToString(),
            Prompt = "Match them",
            Pairs =
            [
                new MatchingPairDto { Id = Guid.NewGuid().ToString(), Left = "Dog", Right = "Woof" },
                new MatchingPairDto { Id = Guid.NewGuid().ToString(), Left = "Cat", Right = "Meow" },
            ],
        };
        var fieldValues = mapper.FromDto(dto, 0);

        // Live entity path.
        var entity = Assert.IsType<MatchingQuestion>(mapper.ToEntity(fieldValues, Guid.NewGuid()));
        var viaEntity = Assert.IsType<MatchingQuestionDto>(mapper.ToDto(mapper.FromEntity(entity)));
        Assert.Equal(dto.Pairs.Select(p => (p.Left, p.Right)), viaEntity.Pairs.Select(p => (p.Left, p.Right)));

        // Attempt-snapshot path (separate sub-entities from the live one).
        var snapshot = mapper.ToSnapshotEntity(fieldValues, Guid.NewGuid());
        var viaSnapshot = Assert.IsType<MatchingQuestionDto>(mapper.ToDto(mapper.FromSnapshot(snapshot)));
        Assert.Equal(dto.Pairs.Select(p => (p.Left, p.Right)), viaSnapshot.Pairs.Select(p => (p.Left, p.Right)));
    }

    [Fact]
    public void Hotspot_question_round_trips_regions_and_the_correct_region_id()
    {
        var region = new HotspotRegionDto { Id = Guid.NewGuid().ToString(), X = 10, Y = 20, Width = 30, Height = 40 };
        var dto = new HotspotQuestionDto
        {
            Id = Guid.NewGuid().ToString(),
            Prompt = "Click the right spot",
            ImageUrl = "data:image/png;base64,abc",
            Regions = [region],
            CorrectRegionId = region.Id,
        };

        var result = Assert.IsType<HotspotQuestionDto>(mapper.ToDto(mapper.FromDto(dto, 0)));

        Assert.Equal(dto.ImageUrl, result.ImageUrl);
        Assert.Equal(region.Id, result.CorrectRegionId);
        var resultRegion = Assert.Single(result.Regions);
        Assert.Equal((region.X, region.Y, region.Width, region.Height), (resultRegion.X, resultRegion.Y, resultRegion.Width, resultRegion.Height));
    }

    [Fact]
    public void Image_grid_question_round_trips_columns_and_correct_tiles()
    {
        var tileA = new OptionDto { Id = Guid.NewGuid().ToString(), Label = "Traffic light", ImageUrl = "a.png" };
        var tileB = new OptionDto { Id = Guid.NewGuid().ToString(), Label = "Tree", ImageUrl = "b.png" };
        var dto = new ImageGridQuestionDto
        {
            Id = Guid.NewGuid().ToString(),
            Prompt = "Select all tiles with a traffic light",
            Columns = 3,
            Options = [tileA, tileB],
            CorrectOptionIds = [tileA.Id],
        };

        var entity = Assert.IsType<ImageGridQuestion>(mapper.ToEntity(mapper.FromDto(dto, 0), Guid.NewGuid()));
        Assert.Equal(3, entity.Columns);

        var result = Assert.IsType<ImageGridQuestionDto>(mapper.ToDto(mapper.FromEntity(entity)));
        Assert.Equal(3, result.Columns);
        Assert.Equal([tileA.Id], result.CorrectOptionIds);
    }

    [Fact]
    public void Puzzle_question_round_trips_image_url_and_piece_count()
    {
        var dto = new PuzzleQuestionDto
        {
            Id = Guid.NewGuid().ToString(),
            Prompt = "Assemble the picture",
            ImageUrl = "data:image/png;base64,abc",
            PieceCount = 12,
        };

        var entity = Assert.IsType<PuzzleQuestion>(mapper.ToEntity(mapper.FromDto(dto, 0), Guid.NewGuid()));
        Assert.Equal(dto.ImageUrl, entity.ImageUrl);
        Assert.Equal(12, entity.PieceCount);

        var result = Assert.IsType<PuzzleQuestionDto>(mapper.ToDto(mapper.FromEntity(entity)));
        Assert.Equal(dto.ImageUrl, result.ImageUrl);
        Assert.Equal(12, result.PieceCount);
    }

    [Fact]
    public void Puzzle_holes_question_round_trips_image_url_piece_count_and_hole_count()
    {
        var dto = new PuzzleHolesQuestionDto
        {
            Id = Guid.NewGuid().ToString(),
            Prompt = "Fill the gaps",
            ImageUrl = "data:image/png;base64,abc",
            PieceCount = 9,
            HoleCount = 3,
        };

        var entity = Assert.IsType<PuzzleHolesQuestion>(mapper.ToEntity(mapper.FromDto(dto, 0), Guid.NewGuid()));
        Assert.Equal(dto.ImageUrl, entity.ImageUrl);
        Assert.Equal(9, entity.PieceCount);
        Assert.Equal(3, entity.HoleCount);

        var result = Assert.IsType<PuzzleHolesQuestionDto>(mapper.ToDto(mapper.FromEntity(entity)));
        Assert.Equal(dto.ImageUrl, result.ImageUrl);
        Assert.Equal(9, result.PieceCount);
        Assert.Equal(3, result.HoleCount);
    }

    [Fact]
    public void Fill_in_the_blank_question_round_trips_ordered_answers_including_a_blank_one()
    {
        var dto = new FillInTheBlankQuestionDto
        {
            Id = Guid.NewGuid().ToString(),
            Prompt = "Fill it in",
            Template = "I went to the {{}} and bought {{}}",
            CorrectAnswers = ["store", null],
        };

        var result = Assert.IsType<FillInTheBlankQuestionDto>(mapper.ToDto(mapper.FromDto(dto, 0)));

        Assert.Equal(dto.Template, result.Template);
        Assert.Equal(["store", null], result.CorrectAnswers);
    }
}
