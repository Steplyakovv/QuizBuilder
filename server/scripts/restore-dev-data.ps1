# Restores the dev data snapshot taken by backup-dev-data.ps1. Truncates the same
# tables POST /api/test/reset does first, so this is safe to run even if the tables
# aren't already empty (e.g. running it twice in a row).
. "$PSScriptRoot\pg-tools.ps1"

if (-not (Test-Path $BackupFile)) {
    throw "No backup found at $BackupFile - run backup-dev-data.ps1 first."
}

$env:PGPASSWORD = $PgPassword
& (Join-Path $PgBinDir "psql.exe") `
    -h $PgHost -U $PgUser -d $PgDatabase `
    -c "TRUNCATE quizzes, quiz_attempts RESTART IDENTITY CASCADE;"

# No --disable-triggers: the quizbuilder role isn't allowed to toggle the RI system
# triggers backing FK constraints. Not needed anyway - the custom-format dump already
# restores tables in FK-dependency order.
& (Join-Path $PgBinDir "pg_restore.exe") `
    -h $PgHost -U $PgUser -d $PgDatabase `
    --data-only `
    $BackupFile

if ($LASTEXITCODE -eq 0) {
    Write-Output "Restored dev data from $BackupFile"
} else {
    throw "pg_restore failed with exit code $LASTEXITCODE"
}
