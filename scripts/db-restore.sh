#!/bin/bash

# Database restore script for Hemera project
# This script restores a PostgreSQL database from backup

set -e

# Configuration
BACKUP_DIR="backups"

echo "🔄 Database restore utility"

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

# Function to list available backups
list_backups() {
    echo "📋 Available backups:"
    if [ -d "${BACKUP_DIR}" ] && [ "$(ls -A ${BACKUP_DIR}/hemera_backup_*.sql.gz 2>/dev/null)" ]; then
        ls -la "${BACKUP_DIR}"/hemera_backup_*.sql.gz | awk '{print NR ". " $9 " (" $5 " bytes, " $6 " " $7 " " $8 ")"}'
    else
        echo "   No backups found in ${BACKUP_DIR}/"
        echo "💡 Create a backup first with: npm run db:backup"
        exit 1
    fi
}

# Function to restore from backup file
restore_backup() {
    local backup_file="$1"
    
    if [ ! -f "${backup_file}" ]; then
        echo "❌ Backup file not found: ${backup_file}"
        exit 1
    fi
    
    echo "⚠️  WARNING: This will completely replace the current database!"
    echo "📁 Backup file: ${backup_file}"
    echo "Are you sure you want to continue? (y/N)"
    read -r response
    
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "❌ Restore cancelled."
        exit 0
    fi
    
    echo "🔄 Restoring database from backup..."
    
    # Decompress if needed
    if [[ "${backup_file}" == *.gz ]]; then
        echo "📦 Decompressing backup..."
        temp_file="/tmp/hemera_restore_$(date +%s).sql"
        gunzip -c "${backup_file}" > "${temp_file}"
        backup_file="${temp_file}"
    fi
    
    # Restore database
    echo "📥 Importing data..."
    docker compose exec -T postgres psql -U hemera_user -d hemera_db < "${backup_file}"
    
    if [ $? -eq 0 ]; then
        echo "✅ Database restored successfully!"
        
        # Clean up temp file if created
        if [[ "${backup_file}" == /tmp/hemera_restore_* ]]; then
            rm -f "${backup_file}"
        fi
        
        echo "🎉 Restore process completed!"
    else
        echo "❌ Restore failed!"
        
        # Clean up temp file if created
        if [[ "${backup_file}" == /tmp/hemera_restore_* ]]; then
            rm -f "${backup_file}"
        fi
        
        exit 1
    fi
}

# Check prerequisites
check_docker
check_postgres

# Handle command line arguments
if [ $# -eq 0 ]; then
    # Interactive mode - list backups and let user choose
    list_backups
    echo ""
    echo "Enter the number of the backup to restore (or 'q' to quit):"
    read -r choice
    
    if [[ "$choice" == "q" || "$choice" == "Q" ]]; then
        echo "❌ Restore cancelled."
        exit 0
    fi
    
    # Get the selected backup file
    backup_files=($(ls "${BACKUP_DIR}"/hemera_backup_*.sql.gz 2>/dev/null))
    if [ "${choice}" -gt 0 ] && [ "${choice}" -le "${#backup_files[@]}" ]; then
        selected_backup="${backup_files[$((choice-1))]}"
        restore_backup "${selected_backup}"
    else
        echo "❌ Invalid selection."
        exit 1
    fi
else
    # Command line mode - restore specific file
    restore_backup "$1"
fi