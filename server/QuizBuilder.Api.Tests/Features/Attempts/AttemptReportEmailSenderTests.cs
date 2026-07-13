using MailKit;
using MailKit.Security;
using Microsoft.Extensions.Logging.Abstractions;
using MimeKit;
using NSubstitute;
using QuizBuilder.Api.Data;
using QuizBuilder.Api.Dto;
using QuizBuilder.Api.Features.Attempts;
using QuizBuilder.Api.Models;
using QuizBuilder.Api.Tests.Support;

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

    private static async Task SeedSettingsAsync(QuizBuilderDbContext db, NotificationSettings settings)
    {
        db.NotificationSettings.Add(settings);
        await db.SaveChangesAsync();
    }

    private static AttemptReportEmailSender CreateSender(IMailTransport transport, QuizBuilderDbContext db) =>
        new(transport, db, NullLogger<AttemptReportEmailSender>.Instance);

    [Fact]
    public async Task SendAsync_does_not_connect_or_send_when_the_recipient_is_not_configured()
    {
        await using var db = TestSupport.CreateDbContext();
        await SeedSettingsAsync(db, new NotificationSettings { Id = Guid.NewGuid(), SmtpHost = "smtp.example.com", ReportRecipientEmail = "" });
        var transport = Substitute.For<IMailTransport>();

        await CreateSender(transport, db).SendAsync(CreateQuiz(), CreateAttempt(), CancellationToken.None);

        Assert.Empty(transport.ReceivedCalls());
    }

    [Fact]
    public async Task SendAsync_does_not_connect_or_send_when_the_smtp_host_is_not_configured()
    {
        await using var db = TestSupport.CreateDbContext();
        await SeedSettingsAsync(db, new NotificationSettings { Id = Guid.NewGuid(), SmtpHost = "", ReportRecipientEmail = "admin@example.com" });
        var transport = Substitute.For<IMailTransport>();

        await CreateSender(transport, db).SendAsync(CreateQuiz(), CreateAttempt(), CancellationToken.None);

        Assert.Empty(transport.ReceivedCalls());
    }

    [Fact]
    public async Task SendAsync_connects_authenticates_and_sends_when_fully_configured()
    {
        await using var db = TestSupport.CreateDbContext();
        await SeedSettingsAsync(db, new NotificationSettings
        {
            Id = Guid.NewGuid(),
            SmtpHost = "smtp.example.com",
            SmtpPort = 587,
            SmtpUsername = "user",
            SmtpPassword = "pass",
            SmtpFrom = "quiz@example.com",
            ReportRecipientEmail = "admin@example.com",
        });
        var transport = Substitute.For<IMailTransport>();

        await CreateSender(transport, db).SendAsync(CreateQuiz(), CreateAttempt(), CancellationToken.None);

        await transport.Received(1).ConnectAsync("smtp.example.com", 587, SecureSocketOptions.StartTls, Arg.Any<CancellationToken>());
        await transport.Received(1).AuthenticateAsync("user", "pass", Arg.Any<CancellationToken>());
        await transport.Received(1).SendAsync(Arg.Is<MimeMessage>(m => m.To.ToString().Contains("admin@example.com")), Arg.Any<CancellationToken>());
        await transport.Received(1).DisconnectAsync(true, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task SendAsync_does_not_throw_when_the_transport_fails()
    {
        await using var db = TestSupport.CreateDbContext();
        await SeedSettingsAsync(db, new NotificationSettings { Id = Guid.NewGuid(), SmtpHost = "smtp.example.com", ReportRecipientEmail = "admin@example.com" });
        var transport = Substitute.For<IMailTransport>();
        transport.When(t => t.ConnectAsync(Arg.Any<string>(), Arg.Any<int>(), Arg.Any<SecureSocketOptions>(), Arg.Any<CancellationToken>()))
            .Throw(new InvalidOperationException("connection refused"));

        await CreateSender(transport, db).SendAsync(CreateQuiz(), CreateAttempt(), CancellationToken.None);
    }

    [Fact]
    public async Task SendTestEmailAsync_reports_not_configured_instead_of_silently_no_opping()
    {
        await using var db = TestSupport.CreateDbContext();
        await SeedSettingsAsync(db, new NotificationSettings { Id = Guid.NewGuid() });
        var transport = Substitute.For<IMailTransport>();

        var result = await CreateSender(transport, db).SendTestEmailAsync(CancellationToken.None);

        Assert.False(result.Success);
        Assert.NotNull(result.Error);
        Assert.Empty(transport.ReceivedCalls());
    }

    [Fact]
    public async Task SendTestEmailAsync_returns_success_when_the_transport_succeeds()
    {
        await using var db = TestSupport.CreateDbContext();
        await SeedSettingsAsync(db, new NotificationSettings { Id = Guid.NewGuid(), SmtpHost = "smtp.example.com", ReportRecipientEmail = "admin@example.com" });
        var transport = Substitute.For<IMailTransport>();

        var result = await CreateSender(transport, db).SendTestEmailAsync(CancellationToken.None);

        Assert.True(result.Success);
        Assert.Null(result.Error);
    }

    [Fact]
    public async Task SendTestEmailAsync_surfaces_the_real_error_message_instead_of_swallowing_it()
    {
        await using var db = TestSupport.CreateDbContext();
        await SeedSettingsAsync(db, new NotificationSettings { Id = Guid.NewGuid(), SmtpHost = "smtp.example.com", ReportRecipientEmail = "admin@example.com" });
        var transport = Substitute.For<IMailTransport>();
        transport.When(t => t.ConnectAsync(Arg.Any<string>(), Arg.Any<int>(), Arg.Any<SecureSocketOptions>(), Arg.Any<CancellationToken>()))
            .Throw(new InvalidOperationException("535: 5.7.8 Incorrect authentication data"));

        var result = await CreateSender(transport, db).SendTestEmailAsync(CancellationToken.None);

        Assert.False(result.Success);
        Assert.Equal("535: 5.7.8 Incorrect authentication data", result.Error);
    }
}
