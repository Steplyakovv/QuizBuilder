using MediatR;
using QuizBuilder.Api.Features.Attempts;

namespace QuizBuilder.Api.Features.Settings;

public record SendTestNotificationEmailCommand : IRequest<NotificationSendResult>;

public class SendTestNotificationEmailCommandHandler(IAttemptReportEmailSender emailSender)
    : IRequestHandler<SendTestNotificationEmailCommand, NotificationSendResult>
{
    public Task<NotificationSendResult> Handle(SendTestNotificationEmailCommand request, CancellationToken cancellationToken) =>
        emailSender.SendTestEmailAsync(cancellationToken);
}
