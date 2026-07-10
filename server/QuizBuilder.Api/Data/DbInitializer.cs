using Microsoft.EntityFrameworkCore;
using QuizBuilder.Api.Auth;
using QuizBuilder.Api.Models;

namespace QuizBuilder.Api.Data;

public static class DbInitializer
{
    public static async Task MigrateAndSeedAsync(WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<QuizBuilderDbContext>();
        await db.Database.MigrateAsync();

        if (!await db.AdminUsers.AnyAsync())
        {
            var config = app.Configuration.GetSection("AdminSeed");
            var username = config["Username"] ?? "admin";
            var password = config["Password"] ?? "admin";
            db.AdminUsers.Add(new AdminUser
            {
                Id = Guid.NewGuid(),
                Username = username,
                PasswordHash = PasswordHasher.Hash(password),
            });
            await db.SaveChangesAsync();
        }
    }
}
