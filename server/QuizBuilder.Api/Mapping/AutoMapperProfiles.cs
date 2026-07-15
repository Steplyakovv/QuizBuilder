using AutoMapper;
using QuizBuilder.Api.Dto;
using QuizBuilder.Api.Models;

namespace QuizBuilder.Api.Mapping;

/// <summary>
/// Guid/DateTimeOffset on entities are represented as strings on the DTOs (matching the
/// TS models one-to-one) - these conversions are shared by every profile below.
/// </summary>
public class ScalarConversionsProfile : Profile
{
    public ScalarConversionsProfile()
    {
        CreateMap<Guid, string>().ConvertUsing(g => g.ToString());
        CreateMap<Guid?, string?>().ConvertUsing(g => g.HasValue ? g.Value.ToString() : null);
        CreateMap<string, Guid>().ConvertUsing(s => Guid.Parse(s));
        CreateMap<string?, Guid?>().ConvertUsing(s => string.IsNullOrEmpty(s) ? (Guid?)null : Guid.Parse(s));

        CreateMap<DateTimeOffset, string>().ConvertUsing(d => d.ToString("o"));
        CreateMap<DateTimeOffset?, string?>().ConvertUsing(d => d.HasValue ? d.Value.ToString("o") : null);
        CreateMap<string, DateTimeOffset>().ConvertUsing(s => DateTimeOffset.Parse(s));
        CreateMap<string?, DateTimeOffset?>().ConvertUsing(s => string.IsNullOrEmpty(s) ? (DateTimeOffset?)null : DateTimeOffset.Parse(s));
    }
}

/// <summary>
/// Scalar (non-collection) fields of Quiz/QuizAttempt only. The polymorphic Question ↔
/// QuestionDto mapping (18 concrete types via QuestionFieldValues) and the child-collection
/// details of QuizAttempt stay hand-written in QuestionMapper - a discriminated-union fan-out
/// like that is a poor fit for AutoMapper and would need more profile code than the mapper
/// it'd replace. See QuizMapper/AttemptMapper for how these are combined with QuestionMapper.
/// </summary>
public class QuizMappingProfile : Profile
{
    public QuizMappingProfile()
    {
        CreateMap<Quiz, QuizSettingsDto>();

        CreateMap<Quiz, QuizDto>()
            .ForMember(d => d.Questions, opt => opt.Ignore())
            .ForMember(d => d.Pages, opt => opt.Ignore())
            .ForMember(d => d.Settings, opt => opt.MapFrom(s => s));

        CreateMap<QuizDto, Quiz>()
            .ForMember(d => d.IsGraded, opt => opt.MapFrom(s => s.Settings.IsGraded))
            .ForMember(d => d.ShuffleQuestions, opt => opt.MapFrom(s => s.Settings.ShuffleQuestions))
            .ForMember(d => d.TimeLimitMinutes, opt => opt.MapFrom(s => s.Settings.TimeLimitMinutes))
            .ForMember(d => d.MaxAttempts, opt => opt.MapFrom(s => s.Settings.MaxAttempts))
            .ForMember(d => d.Published, opt => opt.MapFrom(s => s.Settings.Published))
            .ForMember(d => d.AccessPassword, opt => opt.MapFrom(s => s.Settings.AccessPassword))
            .ForMember(d => d.ExpiresAt, opt => opt.MapFrom(s => s.Settings.ExpiresAt))
            .ForMember(d => d.WebhookUrl, opt => opt.MapFrom(s => s.Settings.WebhookUrl))
            .ForMember(d => d.Pages, opt => opt.Ignore())
            .ForMember(d => d.Questions, opt => opt.Ignore())
            .ForMember(d => d.Attempts, opt => opt.Ignore());
    }
}

public class AttemptMappingProfile : Profile
{
    public AttemptMappingProfile()
    {
        CreateMap<QuizAttempt, QuizAttemptDto>()
            .ForMember(d => d.Responses, opt => opt.Ignore())
            .ForMember(d => d.QuizSnapshot, opt => opt.Ignore())
            .ForMember(d => d.QuestionReport, opt => opt.Ignore());

        CreateMap<QuizAttemptDto, QuizAttempt>()
            .ForMember(d => d.SnapshotIsGraded, opt => opt.Ignore())
            .ForMember(d => d.Responses, opt => opt.Ignore())
            .ForMember(d => d.QuestionSnapshots, opt => opt.Ignore())
            .ForMember(d => d.Quiz, opt => opt.Ignore());

        CreateMap<QuestionResponse, QuestionResponseDto>()
            .ForMember(d => d.SelectedOptionIds, opt => opt.MapFrom(s =>
                s.SelectedOptions.Count == 0 ? null : s.SelectedOptions.Select(o => o.OptionId.ToString()).ToList()))
            .ForMember(d => d.Distribution, opt => opt.MapFrom(s =>
                s.Distributions.Count == 0 ? null : s.Distributions.ToDictionary(x => x.OptionId.ToString(), x => x.Points)))
            .ForMember(d => d.Blanks, opt => opt.MapFrom(s =>
                s.Blanks.Count == 0 ? null : s.Blanks.OrderBy(b => b.Position).Select(b => b.Answer ?? "").ToList()))
            .ForMember(d => d.Matches, opt => opt.MapFrom(s =>
                s.Matches.Count == 0 ? null : s.Matches.ToDictionary(m => m.KeyId.ToString(), m => m.ValueId.ToString())))
            .ForMember(d => d.PuzzlePlacements, opt => opt.MapFrom(s =>
                s.PuzzlePlacements.Count == 0 ? null : s.PuzzlePlacements.Select(p => new PuzzlePlacementDto
                {
                    PieceIndex = p.PieceIndex, CellIndex = p.CellIndex, RotationDegrees = p.RotationDegrees,
                }).ToList()));

        CreateMap<QuestionResponseDto, QuestionResponse>()
            .ForMember(d => d.Id, opt => opt.MapFrom(_ => Guid.NewGuid()))
            .ForMember(d => d.AttemptId, opt => opt.Ignore())
            .ForMember(d => d.Attempt, opt => opt.Ignore())
            .ForMember(d => d.SelectedOptions, opt => opt.MapFrom(s =>
                (s.SelectedOptionIds ?? new List<string>()).Select(id => new ResponseSelectedOption { Id = Guid.NewGuid(), OptionId = Guid.Parse(id) })))
            .ForMember(d => d.Distributions, opt => opt.MapFrom(s =>
                (s.Distribution ?? new Dictionary<string, int>()).Select(kv => new ResponseDistribution { Id = Guid.NewGuid(), OptionId = Guid.Parse(kv.Key), Points = kv.Value })))
            .ForMember(d => d.Blanks, opt => opt.MapFrom(s =>
                (s.Blanks ?? new List<string>()).Select((b, i) => new ResponseBlank { Id = Guid.NewGuid(), Position = i, Answer = b })))
            .ForMember(d => d.Matches, opt => opt.MapFrom(s =>
                (s.Matches ?? new Dictionary<string, string>()).Select(kv => new ResponseMatch { Id = Guid.NewGuid(), KeyId = Guid.Parse(kv.Key), ValueId = Guid.Parse(kv.Value) })))
            .ForMember(d => d.PuzzlePlacements, opt => opt.MapFrom(s =>
                (s.PuzzlePlacements ?? new List<PuzzlePlacementDto>()).Select(p => new ResponsePuzzlePlacement
                {
                    Id = Guid.NewGuid(), PieceIndex = p.PieceIndex, CellIndex = p.CellIndex, RotationDegrees = p.RotationDegrees,
                })));

        CreateMap<ResponseFile, ResponseFileDto>()
            .ForMember(d => d.Name, opt => opt.MapFrom(s => s.FileName))
            .ForMember(d => d.DataUrl, opt => opt.MapFrom(s => $"data:{s.ContentType};base64,{Convert.ToBase64String(s.Content)}"));

        // ConvertUsing takes over null-handling too (unlike plain ForMember/MapFrom, which
        // short-circuits to a null destination automatically) - dto is null whenever the
        // response has no file, so that has to be handled explicitly here.
        CreateMap<ResponseFileDto, ResponseFile>().ConvertUsing((dto, _) =>
        {
            if (dto is null)
            {
                return null!;
            }
            var (contentType, bytes) = ParseDataUrl(dto.DataUrl);
            return new ResponseFile { Id = Guid.NewGuid(), FileName = dto.Name, ContentType = contentType, Content = bytes };
        });
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
