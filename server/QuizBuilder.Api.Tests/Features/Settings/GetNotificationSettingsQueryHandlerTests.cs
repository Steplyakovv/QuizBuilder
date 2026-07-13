using QuizBuilder.Api.Features.Settings;
using QuizBuilder.Api.Models;
using QuizBuilder.Api.Tests.Support;

namespace QuizBuilder.Api.Tests.Features.Settings;

public class GetNotificationSettingsQueryHandlerTests
{
    [Fact]
    public async Task Returns_HasPassword_true_but_never_the_raw_password()
    {
        await using var db = TestSupport.CreateDbContext();
        db.NotificationSettings.Add(new NotificationSettings
        {
            Id = Guid.NewGuid(),
            SmtpHost = "smtp.example.com",
            SmtpPort = 465,
            SmtpUsername = "user",
            SmtpPassword = "super-secret",
            SmtpFrom = "quiz@example.com",
            SmtpUseStartTls = false,
            ReportRecipientEmail = "admin@example.com",
        });
        await db.SaveChangesAsync();

        var handler = new GetNotificationSettingsQueryHandler(db);
        var result = await handler.Handle(new GetNotificationSettingsQuery(), CancellationToken.None);

        Assert.Equal("smtp.example.com", result.Host);
        Assert.Equal(465, result.Port);
        Assert.Equal("user", result.Username);
        Assert.True(result.HasPassword);
        Assert.Null(result.Password);
        Assert.Equal("quiz@example.com", result.From);
        Assert.False(result.UseStartTls);
        Assert.Equal("admin@example.com", result.ReportRecipientEmail);
    }

    [Fact]
    public async Task Returns_HasPassword_false_when_no_password_is_stored()
    {
        await using var db = TestSupport.CreateDbContext();
        db.NotificationSettings.Add(new NotificationSettings { Id = Guid.NewGuid() });
        await db.SaveChangesAsync();

        var handler = new GetNotificationSettingsQueryHandler(db);
        var result = await handler.Handle(new GetNotificationSettingsQuery(), CancellationToken.None);

        Assert.False(result.HasPassword);
    }
}
