#!/bin/bash

# Database backup script for Hemera project
# This script creates a backup of the PostgreSQL database

set -e

# Configuration
BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="hemera_backup_${TIMESTAMP}.sql"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"

echo "🗄️  Creating database backup..."

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to check if PostgreSQL container is running
check_postgres() {
    if ! docker compose ps postgres | grep -q "running"; then
        echo "❌ PostgreSQL container is not running."
        echo "💡 Start it with: npm run db:start"
        exit 1
    fi
}

# Check prerequisites
check_docker
check_postgres

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Create backup
echo "📦 Creating backup: ${BACKUP_FILE}"
docker compose exec -T postgres pg_dump -U hemera_user -d hemera_db --clean --if-exists > "${BACKUP_PATH}"

if [ $? -eq 0 ]; then
    # Compress backup
    echo "🗜️  Compressing backup..."
    gzip "${BACKUP_PATH}"
    COMPRESSED_FILE="${BACKUP_PATH}.gz"
    
    # Get file size
    BACKUP_SIZE=$(du -h "${COMPRESSED_FILE}" | cut -f1)
    
    echo "✅ Backup created successfully!"
    echo "📁 File: ${COMPRESSED_FILE}"
    echo "📏 Size: ${BACKUP_SIZE}"
    
    # Clean up old backups (keep last 10)
    echo "🧹 Cleaning up old backups..."
    cd "${BACKUP_DIR}"
    ls -t hemera_backup_*.sql.gz 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
    cd ..
    
    echo "🎉 Backup process completed!"
else
    echo "❌ Backup failed!"
    rm -f "${BACKUP_PATH}" 2>/dev/null || true
    exit 1
fi