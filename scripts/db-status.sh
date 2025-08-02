#!/bin/bash

# Database status script for Hemera project
# This script shows the current status of the PostgreSQL database

set -e

echo "📊 Hemera PostgreSQL Database Status"
echo "===================================="

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Docker Status: NOT RUNNING"
        echo "💡 Start Docker and try again"
        return 1
    else
        echo "✅ Docker Status: RUNNING"
        return 0
    fi
}

# Function to check PostgreSQL container status
check_container() {
    local container_status=$(docker compose ps postgres --format "table {{.State}}" | tail -n +2)
    
    if [ -z "$container_status" ]; then
        echo "❌ PostgreSQL Container: NOT FOUND"
        echo "💡 Run 'npm run db:setup' to create the container"
        return 1
    elif [ "$container_status" = "running" ]; then
        echo "✅ PostgreSQL Container: RUNNING"
        
        # Get container details
        local container_info=$(docker compose ps postgres --format "table {{.Names}}\t{{.Ports}}" | tail -n +2)
        echo "📋 Container Info: $container_info"
        return 0
    else
        echo "⚠️  PostgreSQL Container: $container_status"
        echo "💡 Run 'npm run db:start' to start the container"
        return 1
    fi
}

# Function to check database connectivity
check_database() {
    if docker compose exec postgres pg_isready -U hemera_user -d hemera_db > /dev/null 2>&1; then
        echo "✅ Database Connection: READY"
        
        # Get database info
        local db_version=$(docker compose exec -T postgres psql -U hemera_user -d hemera_db -t -c "SELECT version();" 2>/dev/null | head -1 | sed 's/^ *//' | cut -d',' -f1)
        echo "🔢 Database Version: $db_version"
        
        # Get database size
        local db_size=$(docker compose exec -T postgres psql -U hemera_user -d hemera_db -t -c "SELECT pg_size_pretty(pg_database_size('hemera_db'));" 2>/dev/null | sed 's/^ *//')
        echo "💾 Database Size: $db_size"
        
        # Get connection count
        local connections=$(docker compose exec -T postgres psql -U hemera_user -d hemera_db -t -c "SELECT count(*) FROM pg_stat_activity WHERE datname='hemera_db';" 2>/dev/null | sed 's/^ *//')
        echo "🔗 Active Connections: $connections"
        
        return 0
    else
        echo "❌ Database Connection: FAILED"
        echo "💡 Check if the container is running and healthy"
        return 1
    fi
}

# Function to show table information
show_tables() {
    echo ""
    echo "📋 Database Tables:"
    echo "==================="
    
    local tables=$(docker compose exec -T postgres psql -U hemera_user -d hemera_db -t -c "
        SELECT schemaname, tablename, 
               pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
        FROM pg_tables 
        WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
        ORDER BY schemaname, tablename;
    " 2>/dev/null)
    
    if [ -n "$tables" ]; then
        echo "$tables" | while read line; do
            if [ -n "$line" ]; then
                echo "  $line"
            fi
        done
    else
        echo "  No user tables found"
    fi
}

# Function to show recent activity
show_activity() {
    echo ""
    echo "📈 Recent Activity:"
    echo "=================="
    
    local activity=$(docker compose exec -T postgres psql -U hemera_user -d hemera_db -t -c "
        SELECT application_name, state, query_start, 
               left(query, 50) || '...' as query_preview
        FROM pg_stat_activity 
        WHERE datname='hemera_db' AND pid != pg_backend_pid()
        ORDER BY query_start DESC 
        LIMIT 5;
    " 2>/dev/null)
    
    if [ -n "$activity" ]; then
        echo "$activity" | while read line; do
            if [ -n "$line" ]; then
                echo "  $line"
            fi
        done
    else
        echo "  No recent activity"
    fi
}

# Function to show backup information
show_backups() {
    echo ""
    echo "💾 Available Backups:"
    echo "===================="
    
    if [ -d "backups" ] && [ "$(ls -A backups/hemera_backup_*.sql.gz 2>/dev/null)" ]; then
        ls -la backups/hemera_backup_*.sql.gz | tail -5 | awk '{print "  " $9 " (" $5 " bytes, " $6 " " $7 " " $8 ")"}'
        
        local backup_count=$(ls backups/hemera_backup_*.sql.gz 2>/dev/null | wc -l)
        echo "  Total backups: $backup_count"
    else
        echo "  No backups found"
        echo "  💡 Create a backup with: npm run db:backup"
    fi
}

# Main execution
echo ""

# Check Docker
if ! check_docker; then
    exit 1
fi

echo ""

# Check container
if ! check_container; then
    exit 1
fi

echo ""

# Check database
if check_database; then
    show_tables
    show_activity
fi

show_backups

echo ""
echo "🔧 Available Commands:"
echo "====================="
echo "  npm run db:start   - Start the database"
echo "  npm run db:stop    - Stop the database"
echo "  npm run db:reset   - Reset the database"
echo "  npm run db:backup  - Create a backup"
echo "  npm run db:restore - Restore from backup"
echo "  npm run db:migrate - Run migrations"
echo ""