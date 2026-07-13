using NSubstitute;
using QuizBuilder.Api.Features.Attempts;
using QuizBuilder.Api.Features.Settings;

namespace QuizBuilder.Api.Tests.Features.Settings;

public class SendTestNotificationEmailCommandHandlerTests
{
    [Fact]
    public async Task Delegates_to_the_email_sender_and_returns_its_result()
    {
        var emailSender = Substitute.For<IAttemptReportEmailSender>();
        emailSender.SendTestEmailAsync(Arg.Any<CancellationToken>())
            .Returns(new NotificationSendResult(false, "535: 5.7.8 Incorrect authentication data"));
        var handler = new SendTestNotificationEmailCommandHandler(emailSender);

        var result = await handler.Handle(new SendTestNotificationEmailCommand(), CancellationToken.None);

        Assert.False(result.Success);
        Assert.Equal("535: 5.7.8 Incorrect authentication data", result.Error);
    }
}
