using MailKit;
using MailKit.Security;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using MimeKit;
using NSubstitute;
using QuizBuilder.Api.Dto;
using QuizBuilder.Api.Features.Attempts;
using QuizBuilder.Api.Models;

namespace QuizBuilder.Api.Tests.Features.Attempts;

public class AttemptReportEmailSenderTests
{
    private static Quiz CreateQuiz() => new() { Id = Guid.NewGuid(), Title = "My quiz", IsGraded = true };

    private static QuizAttemptDto CreateAttempt() => new()
    {
        Id = Guid.NewGuid().ToString(),
        QuizId = Guid.NewGuid().ToString(),
        StartedAt = DateTimeOffset.UtcNow.ToString("o"),
        Responses = [],
        QuestionReport = [],
    };

    private static AttemptReportEmailSender CreateSender(
        IMailTransport transport, SmtpOptions smtp, NotificationOptions notifications) =>
        new(transport, Options.Create(smtp), Options.Create(notifications), NullLogger<AttemptReportEmailSender>.Instance);

    [Fact]
    public async Task Does_not_connect_or_send_when_the_recipient_is_not_configured()
    {
        var transport = Substitute.For<IMailTransport>();
        var sender = CreateSender(transport, new SmtpOptions { Host = "smtp.example.com" }, new NotificationOptions { ReportRecipientEmail = "" });

        await sender.SendAsync(CreateQuiz(), CreateAttempt(), CancellationToken.None);

        Assert.Empty(transport.ReceivedCalls());
    }

    [Fact]
    public async Task Does_not_connect_or_send_when_the_smtp_host_is_not_configured()
    {
        var transport = Substitute.For<IMailTransport>();
        var sender = CreateSender(transport, new SmtpOptions { Host = "" }, new NotificationOptions { ReportRecipientEmail = "admin@example.com" });

        await sender.SendAsync(CreateQuiz(), CreateAttempt(), CancellationToken.None);

        Assert.Empty(transport.ReceivedCalls());
    }

    [Fact]
    public async Task Connects_authenticates_and_sends_when_fully_configured()
    {
        var transport = Substitute.For<IMailTransport>();
        var smtp = new SmtpOptions { Host = "smtp.example.com", Port = 587, Username = "user", Password = "pass", From = "quiz@example.com" };
        var notifications = new NotificationOptions { ReportRecipientEmail = "admin@example.com" };
        var sender = CreateSender(transport, smtp, notifications);

        await sender.SendAsync(CreateQuiz(), CreateAttempt(), CancellationToken.None);

        await transport.Received(1).ConnectAsync("smtp.example.com", 587, SecureSocketOptions.StartTls, Arg.Any<CancellationToken>());
        await transport.Received(1).AuthenticateAsync("user", "pass", Arg.Any<CancellationToken>());
        await transport.Received(1).SendAsync(Arg.Is<MimeMessage>(m => m.To.ToString().Contains("admin@example.com")), Arg.Any<CancellationToken>());
        await transport.Received(1).DisconnectAsync(true, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Does_not_throw_when_the_transport_fails()
    {
        var transport = Substitute.For<IMailTransport>();
        transport.When(t => t.ConnectAsync(Arg.Any<string>(), Arg.Any<int>(), Arg.Any<SecureSocketOptions>(), Arg.Any<CancellationToken>()))
            .Throw(new InvalidOperationException("connection refused"));
        var smtp = new SmtpOptions { Host = "smtp.example.com" };
        var notifications = new NotificationOptions { ReportRecipientEmail = "admin@example.com" };
        var sender = CreateSender(transport, smtp, notifications);

        await sender.SendAsync(CreateQuiz(), CreateAttempt(), CancellationToken.None);
    }
}
