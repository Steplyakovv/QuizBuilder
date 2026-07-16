using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using QuizBuilder.Api.Data;

namespace QuizBuilder.Api.Tests.Data;

/// <summary>
/// server/scripts/backup-dev-data.ps1 backs up dev data via an explicit table allow-list rather
/// than a schema-driven dump, so a migration that adds a table reachable from quizzes/quiz_attempts
/// silently isn't backed up unless someone remembers to update the script by hand (this happened
/// for real with response_puzzle_placements/response_puzzle_hole_placements). This test compares
/// the script's table list against the actual EF model so a forgotten table fails the build instead
/// of silently losing data on the next backup.
/// </summary>
public class BackupScriptTableCoverageTests
{
    // Never touched by POST /api/test/reset and deliberately excluded from the backup - see the
    // header comment in backup-dev-data.ps1.
    private static readonly HashSet<string> ExcludedTables = new(StringComparer.Ordinal)
    {
        "admin_users",
        "notification_settings",
    };

    [Fact]
    public void Backup_script_table_list_matches_the_ef_model()
    {
        // Npgsql (not InMemory) on purpose: table names come from the relational conventions
        // pipeline (DbSet property name -> snake_case), which the InMemory provider doesn't run
        // at all - it'd report singular CLR-type-derived names ("quiz") instead of the real
        // ("quizzes"). No connection is ever opened; only the model is built.
        var options = new DbContextOptionsBuilder<QuizBuilderDbContext>()
            .UseNpgsql("Host=localhost;Database=model-build-only")
            .UseSnakeCaseNamingConvention()
            .Options;
        using var context = new QuizBuilderDbContext(options);

        var modelTables = context.Model.GetEntityTypes()
            .Select(e => e.GetTableName())
            .Where(name => name is not null && !ExcludedTables.Contains(name))
            .Select(name => name!)
            .ToHashSet(StringComparer.Ordinal);

        var scriptTables = ParseTableList(File.ReadAllText(FindBackupScript()));

        var missing = modelTables.Except(scriptTables).OrderBy(n => n).ToList();
        var stale = scriptTables.Except(modelTables).OrderBy(n => n).ToList();

        Assert.True(missing.Count == 0,
            $"backup-dev-data.ps1 is missing table(s) that exist in the EF model: {string.Join(", ", missing)}. " +
            "Add them to the $tables array, or that data silently won't be backed up.");
        Assert.True(stale.Count == 0,
            $"backup-dev-data.ps1 lists table(s) that no longer exist in the EF model: {string.Join(", ", stale)}. " +
            "Remove them from the $tables array.");
    }

    private static string FindBackupScript()
    {
        var dir = AppContext.BaseDirectory;
        while (dir is not null)
        {
            var candidate = Path.Combine(dir, "server", "scripts", "backup-dev-data.ps1");
            if (File.Exists(candidate))
            {
                return candidate;
            }
            dir = Path.GetDirectoryName(dir);
        }
        throw new FileNotFoundException("Could not locate server/scripts/backup-dev-data.ps1 above the test output directory.");
    }

    private static HashSet<string> ParseTableList(string script)
    {
        var arrayMatch = Regex.Match(script, @"\$tables\s*=\s*@\((.*?)\)", RegexOptions.Singleline);
        if (!arrayMatch.Success)
        {
            throw new InvalidOperationException("Could not find a '$tables = @(...)' array in backup-dev-data.ps1.");
        }
        return Regex.Matches(arrayMatch.Groups[1].Value, "\"([a-z_]+)\"")
            .Select(m => m.Groups[1].Value)
            .ToHashSet(StringComparer.Ordinal);
    }
}
