using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace QuizBuilder.Api.Dto.Converters;

/// <summary>
/// Reads/writes QuestionDto by its "type" discriminator, order-independently (JsonDocument
/// buffers the whole object, so unlike the built-in [JsonPolymorphic] attribute this doesn't
/// require "type" to be the first property in the payload).
/// </summary>
public sealed class QuestionDtoConverter : JsonConverter<QuestionDto>
{
    private static readonly Dictionary<string, Type> TypesByDiscriminator = new()
    {
        ["single-choice"] = typeof(SingleChoiceQuestionDto),
        ["multiple-choice"] = typeof(MultipleChoiceQuestionDto),
        ["text"] = typeof(TextQuestionDto),
        ["image-choice"] = typeof(ImageChoiceQuestionDto),
        ["image-grid"] = typeof(ImageGridQuestionDto),
        ["true-false"] = typeof(TrueFalseQuestionDto),
        ["dropdown"] = typeof(DropdownQuestionDto),
        ["number"] = typeof(NumberQuestionDto),
        ["date"] = typeof(DateQuestionDto),
        ["rating"] = typeof(RatingQuestionDto),
        ["slider"] = typeof(SliderQuestionDto),
        ["constant-sum"] = typeof(ConstantSumQuestionDto),
        ["word-choice"] = typeof(WordChoiceQuestionDto),
        ["fill-in-the-blank"] = typeof(FillInTheBlankQuestionDto),
        ["ranking"] = typeof(RankingQuestionDto),
        ["matching"] = typeof(MatchingQuestionDto),
        ["matrix"] = typeof(MatrixQuestionDto),
        ["hotspot"] = typeof(HotspotQuestionDto),
        ["file-upload"] = typeof(FileUploadQuestionDto),
        ["puzzle"] = typeof(PuzzleQuestionDto),
    };

    private static readonly Dictionary<Type, string> DiscriminatorsByType =
        TypesByDiscriminator.ToDictionary(kv => kv.Value, kv => kv.Key);

    public override QuestionDto? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        using var document = JsonDocument.ParseValue(ref reader);
        var root = document.RootElement;
        if (!root.TryGetProperty("type", out var typeProperty) ||
            typeProperty.GetString() is not { } discriminator ||
            !TypesByDiscriminator.TryGetValue(discriminator, out var concreteType))
        {
            throw new JsonException("Question payload is missing a valid 'type' discriminator.");
        }
        return (QuestionDto?)root.Deserialize(concreteType, options);
    }

    public override void Write(Utf8JsonWriter writer, QuestionDto value, JsonSerializerOptions options)
    {
        var concreteType = value.GetType();
        var node = JsonSerializer.SerializeToNode(value, concreteType, options)!.AsObject();
        var ordered = new JsonObject { ["type"] = DiscriminatorsByType[concreteType] };
        foreach (var (key, propertyValue) in node)
        {
            ordered[key] = propertyValue?.DeepClone();
        }
        ordered.WriteTo(writer, options);
    }
}
