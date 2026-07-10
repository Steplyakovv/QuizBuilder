namespace QuizBuilder.Api.Models;

/// <summary>
/// question_options is shared by every option-bearing question type; Kind tells
/// matrix questions apart (Row/Column) from everything else (plain Option).
/// </summary>
public enum OptionKind
{
    Option = 0,
    Row = 1,
    Column = 2,
}
