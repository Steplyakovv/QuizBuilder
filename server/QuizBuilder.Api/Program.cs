using System.Text.Json;
using System.Text.Json.Serialization;
using MailKit;
using MailKit.Net.Smtp;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using QuizBuilder.Api.Data;
using QuizBuilder.Api.Endpoints;
using QuizBuilder.Api.Features.Attempts;
using QuizBuilder.Api.Mapping;
using Serilog;
using Serilog.Events;

// Bootstrap logger: catches failures during configuration/DI setup, before the full
// logger (which needs builder.Environment for the log file path) can be created.
Log.Logger = new LoggerConfiguration().WriteTo.Console().CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog((context, loggerConfiguration) => loggerConfiguration
        .MinimumLevel.Information()
        .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
        .Enrich.FromLogContext()
        .WriteTo.Console()
        .WriteTo.File(
            Path.Combine(context.HostingEnvironment.ContentRootPath, "Logs", "quizbuilder-.log"),
            rollingInterval: RollingInterval.Day,
            retainedFileCountLimit: 31,
            outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {SourceContext}: {Message:lj}{NewLine}{Exception}"));

    builder.Services.AddOpenApi();

    builder.Services.AddDbContext<QuizBuilderDbContext>(options =>
        options.UseNpgsql(builder.Configuration.GetConnectionString("Default"))
            .UseSnakeCaseNamingConvention());

    builder.Services.AddAutoMapper(cfg => { }, typeof(Program).Assembly);
    builder.Services.AddScoped<IQuestionMapper, QuestionMapper>();
    builder.Services.AddScoped<IQuizMapper, QuizMapper>();
    builder.Services.AddScoped<IAttemptMapper, AttemptMapper>();
    builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblyContaining<Program>());
    builder.Services.AddHttpContextAccessor();
    builder.Services.AddHttpClient<IAttemptWebhookSender, AttemptWebhookSender>(client =>
        client.Timeout = TimeSpan.FromSeconds(5));

    builder.Services.AddTransient<IMailTransport>(_ => new SmtpClient { Timeout = 10_000 });
    builder.Services.AddScoped<IAttemptReportEmailSender, AttemptReportEmailSender>();
    builder.Services.AddScoped<IAttemptNotificationDispatcher, BackgroundAttemptNotificationDispatcher>();

    builder.Services.ConfigureHttpJsonOptions(options =>
    {
        options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

    var allowedOrigin = builder.Configuration["Cors:AllowedOrigin"] ?? "http://localhost:4200";
    builder.Services.AddCors(options =>
    {
        options.AddDefaultPolicy(policy =>
            policy.WithOrigins(allowedOrigin).AllowAnyHeader().AllowAnyMethod().AllowCredentials());
    });

    builder.Services
        .AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
        .AddCookie(options =>
        {
            options.Cookie.Name = "quizbuilder.auth";
            options.Cookie.HttpOnly = true;
            options.Cookie.SameSite = SameSiteMode.Lax;
            options.ExpireTimeSpan = TimeSpan.FromDays(7);
            options.SlidingExpiration = true;
            // API, not a browser-redirect login page: report status codes instead of 302s.
            options.Events.OnRedirectToLogin = context =>
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                return Task.CompletedTask;
            };
            options.Events.OnRedirectToAccessDenied = context =>
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                return Task.CompletedTask;
            };
        });
    builder.Services.AddAuthorization();

    var app = builder.Build();

    app.UseSerilogRequestLogging();

    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
    }

    app.UseCors();
    app.UseAuthentication();
    app.UseAuthorization();

    app.MapAuthEndpoints();
    app.MapQuizzesEndpoints();
    app.MapAttemptsEndpoints();
    app.MapSettingsEndpoints();
    if (app.Environment.IsDevelopment())
    {
        app.MapTestSupportEndpoints();
    }

    await DbInitializer.MigrateAndSeedAsync(app);

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "QuizBuilder.Api terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
