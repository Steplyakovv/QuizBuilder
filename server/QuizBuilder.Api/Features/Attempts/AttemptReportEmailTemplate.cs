using System.Globalization;
using System.Net;
using System.Text;
using QuizBuilder.Api.Dto;
using QuizBuilder.Api.Models;

namespace QuizBuilder.Api.Features.Attempts;

/// <summary>
/// Pure HTML builder for the attempt report email - inline CSS only (no flexbox/grid) since
/// email clients strip stylesheets and have inconsistent CSS support. All user-supplied text
/// (quiz title, respondent name, question prompts, answers) is HTML-encoded before being
/// embedded - a respondent's free-text answer is untrusted input once it lands in an HTML email.
/// </summary>
public static class AttemptReportEmailTemplate
{
    public static string Render(Quiz quiz, QuizAttemptDto attempt)
    {
        var respondentName = string.IsNullOrWhiteSpace(attempt.RespondentName) ? "Аноним" : attempt.RespondentName;
        var submittedAt = DateTimeOffset.TryParse(attempt.CompletedAt ?? attempt.StartedAt, out var parsed)
            ? parsed.ToString("d MMMM yyyy, HH:mm", CultureInfo.GetCultureInfo("ru-RU"))
            : attempt.CompletedAt ?? attempt.StartedAt;

        var sb = new StringBuilder();
        sb.Append("""<div style="max-width:600px;margin:0 auto;padding:24px;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#1f2328;">""");
        sb.Append("""<div style="background:#ffffff;border-radius:12px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">""");

        sb.Append($"""<h1 style="margin:0 0 4px;font-size:20px;">{Encode(quiz.Title)}</h1>""");
        sb.Append($"""<p style="margin:0 0 16px;color:#57606a;font-size:14px;">Респондент: {Encode(respondentName)} · {Encode(submittedAt)}</p>""");

        var graded = attempt.QuestionReport?.Where(q => q.IsCorrect.HasValue).ToList() ?? [];
        if (graded.Count > 0)
        {
            var correctCount = graded.Count(q => q.IsCorrect == true);
            var percent = (int)Math.Round(100.0 * correctCount / graded.Count);
            var pillColor = percent >= 70 ? "#1a7f37" : percent >= 40 ? "#9a6700" : "#cf222e";
            sb.Append($"""
                <div style="display:inline-block;padding:6px 12px;border-radius:999px;background:{pillColor}1a;color:{pillColor};font-weight:bold;font-size:14px;margin-bottom:16px;">
                {correctCount} / {graded.Count} верно ({percent}%)
                </div>
                """);
        }
        else if (!quiz.IsGraded)
        {
            sb.Append("""<p style="margin:0 0 16px;color:#57606a;font-size:13px;">Опрос без начисления баллов — ниже только ответы респондента.</p>""");
        }

        if (attempt.QuestionReport is { Count: > 0 })
        {
            var index = 0;
            foreach (var entry in attempt.QuestionReport)
            {
                index++;
                sb.Append(RenderQuestion(index, entry));
            }
        }
        else
        {
            sb.Append("""<p style="color:#57606a;font-size:14px;">Детали по вопросам недоступны для этой попытки.</p>""");
        }

        sb.Append("</div></div>");
        return sb.ToString();
    }

    private static string RenderQuestion(int index, QuestionReportEntryDto entry)
    {
        var sb = new StringBuilder();
        var borderColor = entry.IsCorrect switch { true => "#1a7f37", false => "#cf222e", null => "#d0d7de" };
        var badge = entry.IsCorrect switch { true => "✓", false => "✗", null => null };
        var badgeColor = entry.IsCorrect == true ? "#1a7f37" : "#cf222e";

        sb.Append($"""<div style="border:1px solid #d0d7de;border-left:4px solid {borderColor};border-radius:8px;padding:14px 16px;margin-bottom:12px;">""");
        sb.Append($"""<p style="margin:0 0 8px;font-weight:bold;font-size:14px;">{index}. {Encode(entry.Prompt)}""");
        if (badge is not null)
        {
            sb.Append($"""<span style="float:right;color:{badgeColor};font-weight:bold;">{badge}</span>""");
        }
        sb.Append("</p>");
        sb.Append($"""<p style="margin:0 0 4px;font-size:14px;"><span style="color:#57606a;">Ответ:</span> {Encode(entry.RespondentAnswer)}</p>""");
        if (entry.CorrectAnswer is not null)
        {
            sb.Append($"""<p style="margin:0;font-size:14px;"><span style="color:#57606a;">Правильный ответ:</span> {Encode(entry.CorrectAnswer)}</p>""");
        }
        sb.Append("</div>");
        return sb.ToString();
    }

    private static string Encode(string? value) => WebUtility.HtmlEncode(value ?? "");
}
