using AutoMapper;
using QuizBuilder.Api.Dto;
using QuizBuilder.Api.Models;

namespace QuizBuilder.Api.Mapping;

public interface IAttemptMapper
{
    QuizAttemptDto ToDto(QuizAttempt attempt);
    QuizAttempt ToEntity(QuizAttemptDto dto);
}

public class AttemptMapper(IMapper mapper) : IAttemptMapper
{
    public QuizAttemptDto ToDto(QuizAttempt attempt)
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

        var dto = mapper.Map<QuizAttemptDto>(attempt);
        return dto with
        {
            Responses = attempt.Responses.Select(mapper.Map<QuestionResponseDto>).ToList(),
            QuizSnapshot = snapshot,
        };
    }

    public QuizAttempt ToEntity(QuizAttemptDto dto)
    {
        var attemptId = Guid.Parse(dto.Id);
        var attempt = mapper.Map<QuizAttempt>(dto);
        attempt.SnapshotIsGraded = dto.QuizSnapshot?.Settings.IsGraded;
        attempt.Responses = dto.Responses.Select(r => ToResponseEntity(r, attemptId)).ToList();
        attempt.QuestionSnapshots = dto.QuizSnapshot?.Questions
            .Select((q, i) => QuestionMapper.ToSnapshotEntity(QuestionMapper.FromDto(q, i), attemptId))
            .ToList() ?? [];
        return attempt;
    }

    private QuestionResponse ToResponseEntity(QuestionResponseDto dto, Guid attemptId)
    {
        var response = mapper.Map<QuestionResponse>(dto);
        response.AttemptId = attemptId;
        return response;
    }
}
