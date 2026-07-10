using AutoMapper;
using QuizBuilder.Api.Dto;
using QuizBuilder.Api.Models;

namespace QuizBuilder.Api.Mapping;

public interface IQuizMapper
{
    QuizDto ToDto(Quiz quiz);

    /// <summary>
    /// Applies a QuizDto's scalar fields onto an existing (or brand-new) Quiz entity.
    /// Pages/Questions are deliberately NOT touched here - see BuildChildren.
    /// </summary>
    void ApplyScalarsTo(Quiz target, QuizDto dto);

    /// <summary>
    /// Builds the quiz's pages/questions as brand-new entities to be explicitly
    /// AddRange()-d rather than assigned to an already-tracked parent's navigation
    /// property: our ids are client-generated (non-default) GUIDs, and EF Core only
    /// reliably marks such entities as "Added" (INSERT) when discovered through an
    /// explicit Add - entities picked up implicitly via a tracked navigation change are
    /// treated as pre-existing and get UPDATE statements issued against rows that don't
    /// exist yet, which fails with DbUpdateConcurrencyException (0 rows affected).
    /// </summary>
    (List<QuizPage> Pages, List<Question> Questions) BuildChildren(QuizDto dto, Guid quizId);
}

public class QuizMapper(IMapper mapper) : IQuizMapper
{
    public QuizDto ToDto(Quiz quiz)
    {
        var dto = mapper.Map<QuizDto>(quiz);
        return dto with
        {
            Questions = quiz.Questions.OrderBy(q => q.Position)
                .Select(q => QuestionMapper.ToDto(QuestionMapper.FromEntity(q)))
                .ToList(),
            Pages = quiz.Pages.Count == 0
                ? null
                : quiz.Pages.OrderBy(p => p.Position).Select(p => new QuizPageDto { Id = p.Id.ToString(), Title = p.Title }).ToList(),
        };
    }

    public void ApplyScalarsTo(Quiz target, QuizDto dto) => mapper.Map(dto, target);

    public (List<QuizPage> Pages, List<Question> Questions) BuildChildren(QuizDto dto, Guid quizId)
    {
        var pages = (dto.Pages ?? []).Select((p, i) => new QuizPage
        {
            Id = Guid.Parse(p.Id), QuizId = quizId, Title = p.Title, Position = i,
        }).ToList();

        var questions = dto.Questions
            .Select((q, i) => QuestionMapper.ToEntity(QuestionMapper.FromDto(q, i), quizId))
            .ToList();

        return (pages, questions);
    }
}
