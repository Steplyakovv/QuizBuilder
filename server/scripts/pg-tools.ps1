# Shared helper: locate the PostgreSQL client binaries. `psql`/`pg_dump`/`pg_restore`
# aren't on PATH by default after the winget install used to set up local Postgres for
# this project, so fall back to the known install location.
function Get-PgBinDir {
    $onPath = Get-Command psql -ErrorAction SilentlyContinue
    if ($onPath) {
        return Split-Path $onPath.Source
    }
    $candidates = Get-ChildItem "C:\Program Files\PostgreSQL" -Directory -ErrorAction SilentlyContinue |
        Sort-Object Name -Descending
    foreach ($candidate in $candidates) {
        $bin = Join-Path $candidate.FullName "bin"
        if (Test-Path (Join-Path $bin "psql.exe")) {
            return $bin
        }
    }
    throw "Could not find PostgreSQL client tools (psql/pg_dump/pg_restore). Install PostgreSQL or add its bin/ folder to PATH."
}

$PgBinDir = Get-PgBinDir
$PgHost = "localhost"
$PgDatabase = "quizbuilder"
$PgUser = "quizbuilder"
$PgPassword = "quizbuilder"
$BackupFile = Join-Path $PSScriptRoot "..\backups\dev-data.dump"
