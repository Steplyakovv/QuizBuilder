using Microsoft.EntityFrameworkCore;
using QuizBuilder.Api.Dto;
using QuizBuilder.Api.Features.Settings;
using QuizBuilder.Api.Models;
using QuizBuilder.Api.Tests.Support;

namespace QuizBuilder.Api.Tests.Features.Settings;

public class SaveNotificationSettingsCommandHandlerTests
{
    private static NotificationSettingsDto CreateDto(string? password = null) => new()
    {
        Host = "smtp.example.com",
        Port = 587,
        Username = "user",
        Password = password,
        From = "quiz@example.com",
        UseStartTls = true,
        ReportRecipientEmail = "admin@example.com",
    };

    [Fact]
    public async Task Saves_the_non_password_fields_onto_the_existing_row()
    {
        await using var db = TestSupport.CreateDbContext();
        db.NotificationSettings.Add(new NotificationSettings { Id = Guid.NewGuid() });
        await db.SaveChangesAsync();

        var handler = new SaveNotificationSettingsCommandHandler(db);
        await handler.Handle(new SaveNotificationSettingsCommand(CreateDto()), CancellationToken.None);

        var saved = await db.NotificationSettings.SingleAsync();
        Assert.Equal("smtp.example.com", saved.SmtpHost);
        Assert.Equal(587, saved.SmtpPort);
        Assert.Equal("user", saved.SmtpUsername);
        Assert.Equal("quiz@example.com", saved.SmtpFrom);
        Assert.Equal("admin@example.com", saved.ReportRecipientEmail);
    }

    [Fact]
    public async Task Overwrites_the_password_when_a_non_empty_value_is_sent()
    {
        await using var db = TestSupport.CreateDbContext();
        db.NotificationSettings.Add(new NotificationSettings { Id = Guid.NewGuid(), SmtpPassword = "old-password" });
        await db.SaveChangesAsync();

        var handler = new SaveNotificationSettingsCommandHandler(db);
        await handler.Handle(new SaveNotificationSettingsCommand(CreateDto("new-password")), CancellationToken.None);

        var saved = await db.NotificationSettings.SingleAsync();
        Assert.Equal("new-password", saved.SmtpPassword);
    }

    [Fact]
    public async Task Preserves_the_existing_password_when_the_incoming_password_is_blank()
    {
        await using var db = TestSupport.CreateDbContext();
        db.NotificationSettings.Add(new NotificationSettings { Id = Guid.NewGuid(), SmtpPassword = "old-password" });
        await db.SaveChangesAsync();

        var handler = new SaveNotificationSettingsCommandHandler(db);
        await handler.Handle(new SaveNotificationSettingsCommand(CreateDto(password: null)), CancellationToken.None);

        var saved = await db.NotificationSettings.SingleAsync();
        Assert.Equal("old-password", saved.SmtpPassword);
    }
}
