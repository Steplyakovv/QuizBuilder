using QuizBuilder.Api.Dto;
using QuizBuilder.Api.Models;

namespace QuizBuilder.Api.Mapping;

public static class AttemptMapper
{
    public static QuizAttemptDto ToDto(QuizAttempt attempt)
    {
        QuizDto? snapshot = null;
        if (attempt.QuestionSnapshots.Count > 0)
        {
            snapshot = new QuizDto
            {
                Id = attempt.QuizId.ToString(),
                Title = attempt.Quiz?.Title ?? "",
                Description = null,
                Questions = attempt.QuestionSnapshots.OrderBy(s => s.Position)
                    .Select(s => QuestionMapper.ToDto(QuestionMapper.FromSnapshot(s)))
                    .ToList(),
                Pages = null,
                Settings = new QuizSettingsDto { IsGraded = attempt.SnapshotIsGraded ?? true },
                CreatedAt = attempt.StartedAt.ToString("o"),
                UpdatedAt = attempt.StartedAt.ToString("o"),
            };
        }

        return new QuizAttemptDto
        {
            Id = attempt.Id.ToString(),
            QuizId = attempt.QuizId.ToString(),
            RespondentName = attempt.RespondentName,
            RespondentClientId = attempt.RespondentClientId,
            StartedAt = attempt.StartedAt.ToString("o"),
            CompletedAt = attempt.CompletedAt?.ToString("o"),
            Responses = attempt.Responses.Select(ToResponseDto).ToList(),
            Score = attempt.Score,
            QuizSnapshot = snapshot,
        };
    }

    public static QuizAttempt ToEntity(QuizAttemptDto dto)
    {
        var attemptId = Guid.Parse(dto.Id);
        return new QuizAttempt
        {
            Id = attemptId,
            QuizId = Guid.Parse(dto.QuizId),
            RespondentName = dto.RespondentName,
            RespondentClientId = dto.RespondentClientId,
            StartedAt = DateTimeOffset.Parse(dto.StartedAt),
            CompletedAt = dto.CompletedAt is null ? null : DateTimeOffset.Parse(dto.CompletedAt),
            Score = dto.Score,
            SnapshotIsGraded = dto.QuizSnapshot?.Settings.IsGraded,
            Responses = dto.Responses.Select(r => ToResponseEntity(r, attemptId)).ToList(),
            QuestionSnapshots = dto.QuizSnapshot?.Questions
                .Select((q, i) => QuestionMapper.ToSnapshotEntity(QuestionMapper.FromDto(q, i), attemptId))
                .ToList() ?? [],
        };
    }

    private static QuestionResponseDto ToResponseDto(QuestionResponse r)
    {
        var selected = r.SelectedOptions.Select(o => o.OptionId.ToString()).ToList();
        var distribution = r.Distributions.ToDictionary(d => d.OptionId.ToString(), d => d.Points);
        var blanks = r.Blanks.OrderBy(b => b.Position).Select(b => b.Answer ?? "").ToList();
        var matches = r.Matches.ToDictionary(m => m.KeyId.ToString(), m => m.ValueId.ToString());
        ResponseFileDto? file = r.File is null
            ? null
            : new ResponseFileDto
            {
                Name = r.File.FileName,
                DataUrl = $"data:{r.File.ContentType};base64,{Convert.ToBase64String(r.File.Content)}",
            };

        return new QuestionResponseDto
        {
            QuestionId = r.QuestionId.ToString(),
            SelectedOptionIds = selected.Count == 0 ? null : selected,
            Text = r.Text,
            Distribution = distribution.Count == 0 ? null : distribution,
            Blanks = blanks.Count == 0 ? null : blanks,
            Matches = matches.Count == 0 ? null : matches,
            File = file,
        };
    }

    private static QuestionResponse ToResponseEntity(QuestionResponseDto dto, Guid attemptId)
    {
        ResponseFile? file = null;
        if (dto.File is not null)
        {
            var (contentType, bytes) = ParseDataUrl(dto.File.DataUrl);
            file = new ResponseFile
            {
                Id = Guid.NewGuid(), FileName = dto.File.Name, ContentType = contentType, Content = bytes,
            };
        }

        return new QuestionResponse
        {
            Id = Guid.NewGuid(),
            AttemptId = attemptId,
            QuestionId = Guid.Parse(dto.QuestionId),
            Text = dto.Text,
            SelectedOptions = (dto.SelectedOptionIds ?? [])
                .Select(id => new ResponseSelectedOption { Id = Guid.NewGuid(), OptionId = Guid.Parse(id) }).ToList(),
            Distributions = (dto.Distribution ?? [])
                .Select(kv => new ResponseDistribution { Id = Guid.NewGuid(), OptionId = Guid.Parse(kv.Key), Points = kv.Value }).ToList(),
            Blanks = (dto.Blanks ?? [])
                .Select((b, i) => new ResponseBlank { Id = Guid.NewGuid(), Position = i, Answer = b }).ToList(),
            Matches = (dto.Matches ?? [])
                .Select(kv => new ResponseMatch { Id = Guid.NewGuid(), KeyId = Guid.Parse(kv.Key), ValueId = Guid.Parse(kv.Value) }).ToList(),
            File = file,
        };
    }

    private static (string ContentType, byte[] Bytes) ParseDataUrl(string dataUrl)
    {
        var commaIndex = dataUrl.IndexOf(',');
        var header = dataUrl[..commaIndex];
        var payload = dataUrl[(commaIndex + 1)..];
        var contentType = header.Replace("data:", "").Replace(";base64", "");
        return (contentType, Convert.FromBase64String(payload));
    }
}
