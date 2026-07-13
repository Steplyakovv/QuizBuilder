using MediatR;
using QuizBuilder.Api.Dto;
using QuizBuilder.Api.Features.Settings;

namespace QuizBuilder.Api.Endpoints;

public static class SettingsEndpoints
{
    public static void MapSettingsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/settings");

        group.MapGet("/notifications", async (ISender sender, HttpContext http) =>
        {
            if (!http.User.IsInRole("admin"))
            {
                return Results.Forbid();
            }
            return Results.Ok(await sender.Send(new GetNotificationSettingsQuery()));
        });

        group.MapPut("/notifications", async (NotificationSettingsDto dto, ISender sender, HttpContext http) =>
        {
            if (!http.User.IsInRole("admin"))
            {
                return Results.Forbid();
            }
            await sender.Send(new SaveNotificationSettingsCommand(dto));
            return Results.Ok();
        });

        group.MapPost("/notifications/test-email", async (ISender sender, HttpContext http) =>
        {
            if (!http.User.IsInRole("admin"))
            {
                return Results.Forbid();
            }
            return Results.Ok(await sender.Send(new SendTestNotificationEmailCommand()));
        });
    }
}
