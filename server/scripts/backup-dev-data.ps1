# Snapshots local dev data (quizzes, attempts, and everything under them) so it can be
# restored after a `npm run test:e2e` run wipes the same tables via POST /api/test/reset.
# admin_users and __EFMigrationsHistory are deliberately not backed up: reset doesn't
# touch them, and re-inserting them on restore would just collide on primary key.
. "$PSScriptRoot\pg-tools.ps1"

New-Item -ItemType Directory -Force -Path (Split-Path $BackupFile) | Out-Null

# Explicit allow-list rather than --exclude-table: the excluded tables' names don't
# match reliably through pg_dump's pattern matching once PowerShell/Windows argv
# quoting is involved (the mixed-case "__EFMigrationsHistory" in particular).
$tables = @(
    "quizzes", "quiz_pages", "questions", "question_options", "matching_pairs",
    "hotspot_regions", "fill_blank_answers", "quiz_attempts", "question_responses",
    "response_selected_options", "response_distributions", "response_blanks",
    "response_matches", "response_files", "attempt_question_snapshots",
    "attempt_option_snapshots", "attempt_matching_pair_snapshots",
    "attempt_hotspot_region_snapshots", "attempt_fill_blank_answer_snapshots"
)
$tableArgs = $tables | ForEach-Object { "--table=$_" }

$env:PGPASSWORD = $PgPassword
& (Join-Path $PgBinDir "pg_dump.exe") `
    -h $PgHost -U $PgUser -d $PgDatabase `
    --data-only @tableArgs `
    --format=custom --file=$BackupFile

if ($LASTEXITCODE -eq 0) {
    Write-Output "Backed up dev data to $BackupFile"
} else {
    throw "pg_dump failed with exit code $LASTEXITCODE"
}
