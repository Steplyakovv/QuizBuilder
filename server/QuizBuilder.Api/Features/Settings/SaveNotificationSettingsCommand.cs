using MediatR;
using Microsoft.EntityFrameworkCore;
using QuizBuilder.Api.Data;
using QuizBuilder.Api.Dto;

namespace QuizBuilder.Api.Features.Settings;

public record SaveNotificationSettingsCommand(NotificationSettingsDto Settings) : IRequest;

public class SaveNotificationSettingsCommandHandler(QuizBuilderDbContext db) : IRequestHandler<SaveNotificationSettingsCommand>
{
    public async Task Handle(SaveNotificationSettingsCommand request, CancellationToken cancellationToken)
    {
        var settings = await db.NotificationSettings.SingleAsync(cancellationToken);
        var dto = request.Settings;

        settings.SmtpHost = dto.Host;
        settings.SmtpPort = dto.Port;
        settings.SmtpUsername = dto.Username;
        settings.SmtpFrom = dto.From;
        settings.SmtpUseStartTls = dto.UseStartTls;
        settings.ReportRecipientEmail = dto.ReportRecipientEmail;
        // Blank/omitted password means "keep the existing one" - the real value is never
        // round-tripped back into the browser, so an empty field isn't "clear the password".
        if (!string.IsNullOrEmpty(dto.Password))
        {
            settings.SmtpPassword = dto.Password;
        }

        await db.SaveChangesAsync(cancellationToken);
    }
}
