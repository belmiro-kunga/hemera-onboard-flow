#!/bin/bash

# Stop PostgreSQL container (preserving data)
echo "🛑 Stopping PostgreSQL container..."

if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running."
    exit 1
fi

docker compose stop postgres

echo "✅ PostgreSQL container stopped successfully!"
echo "💾 Data has been preserved in Docker volume."
echo ""
echo "To start again, run: npm run db:start"