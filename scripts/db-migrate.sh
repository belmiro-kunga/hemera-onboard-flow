#!/bin/bash

# Database migration script for Hemera project
# This script applies database migrations to the PostgreSQL database

set -e

echo "🔄 Running database migrations..."

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

# Function to wait for database to be ready
wait_for_db() {
    echo "⏳ Waiting for database to be ready..."
    timeout=30
    counter=0

    while ! docker compose exec postgres pg_isready -U hemera_user -d hemera_db > /dev/null 2>&1; do
        if [ $counter -ge $timeout ]; then
            echo "❌ Timeout waiting for PostgreSQL to be ready"
            exit 1
        fi
        sleep 1
        counter=$((counter + 1))
    done
    
    echo "✅ Database is ready!"
}

# Function to run migrations
run_migrations() {
    echo "📋 Applying database migrations..."
    
    # Check if migrations directory exists
    if [ ! -d "database/migrations" ]; then
        echo "❌ Migrations directory not found: database/migrations"
        echo "💡 Make sure you're running this from the project root"
        exit 1
    fi
    
    # Apply each migration file in order
    migration_count=0
    for migration_file in database/migrations/*.sql; do
        if [ -f "$migration_file" ]; then
            echo "📄 Applying: $(basename "$migration_file")"
            
            if docker compose exec -T postgres psql -U hemera_user -d hemera_db < "$migration_file"; then
                echo "✅ Applied: $(basename "$migration_file")"
                migration_count=$((migration_count + 1))
            else
                echo "❌ Failed to apply: $(basename "$migration_file")"
                exit 1
            fi
        fi
    done
    
    if [ $migration_count -eq 0 ]; then
        echo "⚠️  No migration files found in database/migrations/"
        echo "💡 Make sure migration files exist and have .sql extension"
    else
        echo "🎉 Applied $migration_count migrations successfully!"
    fi
}

# Function to run initialization scripts
run_init_scripts() {
    echo "🔧 Running initialization scripts..."
    
    if [ -d "database/init" ]; then
        init_count=0
        for init_file in database/init/*.sql; do
            if [ -f "$init_file" ]; then
                echo "📄 Running: $(basename "$init_file")"
                
                if docker compose exec -T postgres psql -U hemera_user -d hemera_db < "$init_file"; then
                    echo "✅ Completed: $(basename "$init_file")"
                    init_count=$((init_count + 1))
                else
                    echo "❌ Failed: $(basename "$init_file")"
                    exit 1
                fi
            fi
        done
        
        if [ $init_count -gt 0 ]; then
            echo "🎉 Completed $init_count initialization scripts!"
        fi
    else
        echo "ℹ️  No initialization scripts directory found"
    fi
}

# Function to verify migration status
verify_migrations() {
    echo "🔍 Verifying database schema..."
    
    # Check if essential tables exist
    local tables_check=$(docker compose exec -T postgres psql -U hemera_user -d hemera_db -t -c "
        SELECT COUNT(*) FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    " 2>/dev/null | sed 's/^ *//')
    
    if [ "$tables_check" -gt 0 ]; then
        echo "✅ Found $tables_check tables in the database"
        
        # List some key tables
        echo "📋 Key tables:"
        docker compose exec -T postgres psql -U hemera_user -d hemera_db -t -c "
            SELECT '  - ' || tablename as table_list
            FROM pg_tables 
            WHERE schemaname = 'public' 
            ORDER BY tablename 
            LIMIT 10;
        " 2>/dev/null
        
    else
        echo "⚠️  No tables found - migrations may not have been applied correctly"
    fi
}

# Main execution
check_docker
check_postgres
wait_for_db

echo ""
run_migrations

echo ""
run_init_scripts

echo ""
verify_migrations

echo ""
echo "🎉 Database migration completed successfully!"
echo ""
echo "📝 Next steps:"
echo "   - Run 'npm run db:status' to check database status"
echo "   - Run 'npm run dev' to start the application"
echo ""