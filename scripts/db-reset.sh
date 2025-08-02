#!/bin/bash

# Reset PostgreSQL database (WARNING: This will delete all data!)
echo "⚠️  WARNING: This will completely reset the database and delete all data!"
echo "Are you sure you want to continue? (y/N)"
read -r response

if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "❌ Operation cancelled."
    exit 0
fi

echo "🗑️  Resetting PostgreSQL database..."

if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Stop and remove containers and volumes
echo "🛑 Stopping containers..."
docker compose down

echo "🗑️  Removing database volume..."
docker volume rm $(docker compose config --volumes) 2>/dev/null || true

# Recreate everything
echo "🏗️  Recreating database..."
docker compose up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
timeout=60
counter=0

while ! docker compose exec postgres pg_isready -U hemera_user -d hemera_db > /dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
        echo "❌ Timeout waiting for PostgreSQL to be ready"
        exit 1
    fi
    sleep 2
    counter=$((counter + 2))
done

echo "✅ Database reset completed successfully!"
echo "📝 Next step: Run 'npm run db:migrate' to apply migrations"