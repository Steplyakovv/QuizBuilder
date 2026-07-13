using MediatR;
using Microsoft.EntityFrameworkCore;
using QuizBuilder.Api.Data;
using QuizBuilder.Api.Dto;

namespace QuizBuilder.Api.Features.Settings;

public record GetNotificationSettingsQuery : IRequest<NotificationSettingsDto>;

public class GetNotificationSettingsQueryHandler(QuizBuilderDbContext db)
    : IRequestHandler<GetNotificationSettingsQuery, NotificationSettingsDto>
{
    public async Task<NotificationSettingsDto> Handle(GetNotificationSettingsQuery request, CancellationToken cancellationToken)
    {
        var settings = await db.NotificationSettings.SingleAsync(cancellationToken);
        return new NotificationSettingsDto
        {
            Host = settings.SmtpHost,
            Port = settings.SmtpPort,
            Username = settings.SmtpUsername,
            HasPassword = !string.IsNullOrEmpty(settings.SmtpPassword),
            From = settings.SmtpFrom,
            UseStartTls = settings.SmtpUseStartTls,
            ReportRecipientEmail = settings.ReportRecipientEmail,
        };
    }
}
