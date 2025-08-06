# PowerShell script to run database migrations
param (
    [string]$migrationFile = ""
)

if (-not $migrationFile) {
    Write-Host "Please specify a migration file to run"
    exit 1
}

# Set database connection details (update these if needed)
$dbHost = "localhost"
$dbPort = "5432"
$dbName = "hemera_db"
$dbUser = "hemera_user"
$dbPassword = "hemera_password"

# Build the connection string
$connectionString = "host=$dbHost port=$dbPort dbname=$dbName user=$dbUser password=$dbPassword"

# Run the migration
Write-Host "Running migration: $migrationFile"
$sqlContent = Get-Content -Path $migrationFile -Raw
& "psql" -c "$sqlContent" -U $dbUser -d $dbName -h $dbHost -p $dbPort
