# PowerShell script to run database migrations using Docker
param (
    [string]$migrationFile = ""
)

if (-not $migrationFile) {
    Write-Host "Please specify a migration file to run"
    exit 1
}

# Check if the file exists
if (-not (Test-Path $migrationFile)) {
    Write-Host "Error: Migration file not found at $migrationFile"
    exit 1
}

# Check if Docker is running
try {
    $dockerInfo = docker info 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Docker is not running or not installed"
    }
} catch {
    Write-Host "Error: Docker is not running or not installed. Please start Docker Desktop and try again."
    exit 1
}

# Check if the container is running
$containerId = docker ps -q -f name=hemera-postgres
if (-not $containerId) {
    Write-Host "Error: hemera-postgres container is not running. Please start the container and try again."
    exit 1
}

# Get the full path of the migration file
$fullPath = Resolve-Path $migrationFile

# Extract just the filename for the container path
$fileName = [System.IO.Path]::GetFileName($migrationFile)

# Copy the migration file to the container
docker cp $fullPath ${containerId}:/tmp/$fileName

# Run the migration inside the container
Write-Host "Running migration: $migrationFile"
docker exec $containerId psql -U hemera_user -d hemera_db -f /tmp/$fileName

# Clean up
docker exec $containerId rm -f /tmp/$fileName
