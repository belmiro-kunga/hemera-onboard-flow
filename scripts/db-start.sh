#!/bin/bash

# Start PostgreSQL container
echo "🚀 Starting PostgreSQL container..."

if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

docker compose up -d postgres

echo "⏳ Waiting for PostgreSQL to be ready..."
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

echo "✅ PostgreSQL is running and ready!"
echo "📊 Container status:"
docker compose ps postgres