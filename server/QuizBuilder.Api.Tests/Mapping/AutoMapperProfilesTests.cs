using AutoMapper;
using QuizBuilder.Api.Dto;
using QuizBuilder.Api.Models;
using QuizBuilder.Api.Tests.Support;

namespace QuizBuilder.Api.Tests.Mapping;

public class AutoMapperProfilesTests
{
    private static IMapper CreateMapper() => TestSupport.CreateAutoMapper();

    [Fact]
    public void Profile_configuration_is_valid()
    {
        CreateMapper().ConfigurationProvider.AssertConfigurationIsValid();
    }

    [Fact]
    public void Quiz_scalars_and_settings_map_onto_QuizDto()
    {
        var mapper = CreateMapper();
        var expiresAt = DateTimeOffset.Parse("2027-01-01T00:00:00Z");
        var quiz = new Quiz
        {
            Id = Guid.NewGuid(),
            Title = "My quiz",
            Description = "A description",
            IsGraded = true,
            ShuffleQuestions = true,
            TimeLimitMinutes = 30,
            MaxAttempts = 3,
            Published = false,
            AccessPassword = "secret",
            ExpiresAt = expiresAt,
            CreatedAt = DateTimeOffset.Parse("2026-01-01T00:00:00Z"),
            UpdatedAt = DateTimeOffset.Parse("2026-02-01T00:00:00Z"),
        };

        var dto = mapper.Map<QuizDto>(quiz);

        Assert.Equal(quiz.Id.ToString(), dto.Id);
        Assert.Equal(quiz.Title, dto.Title);
        Assert.Equal(quiz.Description, dto.Description);
        Assert.Equal(quiz.CreatedAt.ToString("o"), dto.CreatedAt);
        Assert.Equal(quiz.UpdatedAt.ToString("o"), dto.UpdatedAt);
        Assert.True(dto.Settings.IsGraded);
        Assert.True(dto.Settings.ShuffleQuestions);
        Assert.Equal(30, dto.Settings.TimeLimitMinutes);
        Assert.Equal(3, dto.Settings.MaxAttempts);
        Assert.False(dto.Settings.Published);
        Assert.Equal("secret", dto.Settings.AccessPassword);
        Assert.Equal(expiresAt.ToString("o"), dto.Settings.ExpiresAt);
    }

    [Fact]
    public void QuizDto_settings_apply_onto_an_existing_Quiz_entity()
    {
        var mapper = CreateMapper();
        var existing = new Quiz { Id = Guid.NewGuid(), Title = "Old title" };
        var expiresAt = "2027-06-15T12:00:00.0000000+00:00";
        var dto = new QuizDto
        {
            Id = existing.Id.ToString(),
            Title = "New title",
            Description = "New description",
            Questions = [],
            Settings = new QuizSettingsDto
            {
                IsGraded = true,
                ShuffleQuestions = false,
                TimeLimitMinutes = 15,
                MaxAttempts = 1,
                Published = true,
                AccessPassword = null,
                ExpiresAt = expiresAt,
            },
            CreatedAt = "2026-01-01T00:00:00.0000000+00:00",
            UpdatedAt = "2026-03-01T00:00:00.0000000+00:00",
        };

        mapper.Map(dto, existing);

        Assert.Equal("New title", existing.Title);
        Assert.Equal("New description", existing.Description);
        Assert.True(existing.IsGraded);
        Assert.False(existing.ShuffleQuestions);
        Assert.Equal(15, existing.TimeLimitMinutes);
        Assert.Equal(1, existing.MaxAttempts);
        Assert.True(existing.Published);
        Assert.Null(existing.AccessPassword);
        Assert.Equal(DateTimeOffset.Parse(expiresAt), existing.ExpiresAt);
        // Pages/Questions are deliberately untouched by this map - QuizMapper.BuildChildren
        // handles those separately.
        Assert.Empty(existing.Pages);
        Assert.Empty(existing.Questions);
    }

    [Fact]
    public void QuestionResponse_round_trips_selected_options_distribution_blanks_and_matches()
    {
        var mapper = CreateMapper();
        var optionId = Guid.NewGuid().ToString();
        var keyId = Guid.NewGuid().ToString();
        var valueId = Guid.NewGuid().ToString();
        var dto = new QuestionResponseDto
        {
            QuestionId = Guid.NewGuid().ToString(),
            SelectedOptionIds = [optionId],
            Text = "free text",
            Distribution = new Dictionary<string, int> { [optionId] = 100 },
            Blanks = ["first", "second"],
            Matches = new Dictionary<string, string> { [keyId] = valueId },
            File = null,
        };

        var entity = mapper.Map<QuestionResponse>(dto);
        var result = mapper.Map<QuestionResponseDto>(entity);

        Assert.Equal(dto.SelectedOptionIds, result.SelectedOptionIds);
        Assert.Equal(dto.Text, result.Text);
        Assert.Equal(dto.Distribution, result.Distribution);
        Assert.Equal(dto.Blanks, result.Blanks);
        Assert.Equal(dto.Matches, result.Matches);
    }

    [Fact]
    public void QuestionResponse_with_no_file_maps_without_throwing()
    {
        // Regression test: ConvertUsing on ResponseFileDto->ResponseFile used to be called
        // even when the source File was null, throwing a NullReferenceException instead of
        // mapping to a null destination.
        var mapper = CreateMapper();
        var dto = new QuestionResponseDto { QuestionId = Guid.NewGuid().ToString(), File = null };

        var entity = mapper.Map<QuestionResponse>(dto);

        Assert.Null(entity.File);

        var result = mapper.Map<QuestionResponseDto>(entity);
        Assert.Null(result.File);
    }

    [Fact]
    public void QuestionResponse_file_round_trips_as_a_base64_data_url()
    {
        var mapper = CreateMapper();
        var bytes = "hello world"u8.ToArray();
        var dto = new QuestionResponseDto
        {
            QuestionId = Guid.NewGuid().ToString(),
            File = new ResponseFileDto { Name = "notes.txt", DataUrl = $"data:text/plain;base64,{Convert.ToBase64String(bytes)}" },
        };

        var entity = mapper.Map<QuestionResponse>(dto);

        Assert.NotNull(entity.File);
        Assert.Equal("notes.txt", entity.File.FileName);
        Assert.Equal("text/plain", entity.File.ContentType);
        Assert.Equal(bytes, entity.File.Content);

        var result = mapper.Map<QuestionResponseDto>(entity);
        Assert.Equal(dto.File.DataUrl, result.File?.DataUrl);
    }
}
