using QuizBuilder.Api.Dto;
using QuizBuilder.Api.Features.Attempts;
using QuizBuilder.Api.Models;

namespace QuizBuilder.Api.Tests.Features.Attempts;

public class AttemptReportEmailTemplateTests
{
    private static Quiz CreateQuiz(bool isGraded = true) => new()
    {
        Id = Guid.NewGuid(),
        Title = "My quiz",
        IsGraded = isGraded,
    };

    private static QuizAttemptDto CreateAttempt(string? respondentName, List<QuestionReportEntryDto>? questionReport) => new()
    {
        Id = Guid.NewGuid().ToString(),
        QuizId = Guid.NewGuid().ToString(),
        RespondentName = respondentName,
        StartedAt = DateTimeOffset.Parse("2026-01-01T10:00:00Z").ToString("o"),
        CompletedAt = DateTimeOffset.Parse("2026-01-01T10:05:00Z").ToString("o"),
        Responses = [],
        QuestionReport = questionReport,
    };

    [Fact]
    public void Renders_quiz_title_and_falls_back_to_Anonim_for_a_missing_respondent_name()
    {
        var html = AttemptReportEmailTemplate.Render(CreateQuiz(), CreateAttempt(null, []));

        Assert.Contains("My quiz", html);
        Assert.Contains("Аноним", html);
    }

    [Fact]
    public void Renders_the_respondent_name_when_present()
    {
        var html = AttemptReportEmailTemplate.Render(CreateQuiz(), CreateAttempt("Alice", []));

        Assert.Contains("Alice", html);
    }

    [Fact]
    public void Renders_prompt_answer_and_correct_answer_for_a_gradable_question_regardless_of_correctness()
    {
        var correct = new QuestionReportEntryDto
        {
            QuestionId = "q1",
            Prompt = "2+2?",
            RespondentAnswer = "4",
            IsCorrect = true,
            CorrectAnswer = "4",
        };
        var wrong = new QuestionReportEntryDto
        {
            QuestionId = "q2",
            Prompt = "Capital of France?",
            RespondentAnswer = "London",
            IsCorrect = false,
            CorrectAnswer = "Paris",
        };

        var html = AttemptReportEmailTemplate.Render(CreateQuiz(), CreateAttempt("Bob", [correct, wrong]));

        Assert.Contains("2+2?", html);
        Assert.Contains("Capital of France?", html);
        Assert.Contains("London", html);
        Assert.Contains("Paris", html);
        // Correct answer shown even for the correct entry, not just the wrong one.
        Assert.Contains("4", html);
        Assert.Contains("1 / 2 верно (50%)", html);
    }

    [Fact]
    public void Does_not_show_a_badge_or_correct_answer_for_a_non_gradable_question()
    {
        var entry = new QuestionReportEntryDto
        {
            QuestionId = "q1",
            Prompt = "Tell us about yourself",
            RespondentAnswer = "Free text answer",
            IsCorrect = null,
            CorrectAnswer = null,
        };

        var html = AttemptReportEmailTemplate.Render(CreateQuiz(), CreateAttempt("Bob", [entry]));

        Assert.Contains("Free text answer", html);
        Assert.DoesNotContain("Правильный ответ:", html);
    }

    [Fact]
    public void Shows_an_ungraded_note_instead_of_a_score_pill_when_the_quiz_is_not_graded()
    {
        var entry = new QuestionReportEntryDto
        {
            QuestionId = "q1",
            Prompt = "Tell us about yourself",
            RespondentAnswer = "Free text answer",
        };

        var html = AttemptReportEmailTemplate.Render(CreateQuiz(isGraded: false), CreateAttempt("Bob", [entry]));

        Assert.Contains("без начисления баллов", html);
        Assert.DoesNotContain("верно (", html);
    }

    [Fact]
    public void Falls_back_to_a_header_only_render_when_question_report_is_missing()
    {
        var html = AttemptReportEmailTemplate.Render(CreateQuiz(), CreateAttempt("Bob", null));

        Assert.Contains("Bob", html);
        Assert.Contains("недоступны", html);
    }

    [Fact]
    public void Html_encodes_a_respondent_answer_containing_markup()
    {
        var entry = new QuestionReportEntryDto
        {
            QuestionId = "q1",
            Prompt = "Any thoughts?",
            RespondentAnswer = "<script>alert(1)</script> & friends",
        };

        var html = AttemptReportEmailTemplate.Render(CreateQuiz(), CreateAttempt("Bob", [entry]));

        Assert.DoesNotContain("<script>", html);
        Assert.Contains("&lt;script&gt;", html);
        Assert.Contains("&amp; friends", html);
    }
}
