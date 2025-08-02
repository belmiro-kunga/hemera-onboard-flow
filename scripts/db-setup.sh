#!/bin/bash

# Database setup script for Hemera project
# This script initializes the PostgreSQL Docker container and database

set -e

echo "🚀 Setting up Hemera PostgreSQL database..."

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo "⚠️  Docker daemon is not running or accessible."
        echo "🔧 Trying to start Docker service..."
        
        # Try to start Docker service
        if command -v systemctl > /dev/null 2>&1; then
            sudo systemctl start docker
        elif command -v service > /dev/null 2>&1; then
            sudo service docker start
        else
            echo "❌ Could not start Docker service automatically."
            echo "Please start Docker manually and run this script again."
            exit 1
        fi
        
        # Wait a bit for Docker to start
        sleep 3
        
        # Check again
        if ! docker info > /dev/null 2>&1; then
            echo "❌ Docker is still not accessible. Please check Docker installation."
            echo "💡 You may need to add your user to the docker group:"
            echo "   sudo usermod -aG docker $USER"
            echo "   Then logout and login again."
            exit 1
        fi
    fi
}

# Function to check prerequisites
check_prerequisites() {
    echo "🔍 Checking prerequisites..."
    
    # Check if docker-compose.yml exists
    if [ ! -f "docker-compose.yml" ]; then
        echo "❌ docker-compose.yml not found in current directory"
        echo "💡 Make sure you're running this script from the project root"
        exit 1
    fi
    
    # Check if .env.example exists
    if [ ! -f ".env.example" ]; then
        echo "⚠️  .env.example not found - will create basic .env file"
    fi
    
    echo "✅ Prerequisites check passed"
}

# Function to setup environment
setup_environment() {
    # Check if .env file exists, if not copy from example or create basic one
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            echo "📋 Creating .env file from .env.example..."
            cp .env.example .env
        else
            echo "📋 Creating basic .env file..."
            cat > .env << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hemera_db
DB_USER=hemera_user
DB_PASSWORD=hemera_password

# Application Configuration
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
EOF
        fi
        echo "✅ .env file created. Please review and update the configuration if needed."
    else
        echo "✅ .env file already exists"
    fi
}

# Function to create backup directory
setup_directories() {
    echo "📁 Setting up directories..."
    mkdir -p backups
    mkdir -p logs
    echo "✅ Directories created"
}

# Check Docker
check_docker

# Check prerequisites
check_prerequisites

# Setup environment
setup_environment

# Setup directories
setup_directories

# Stop existing container if running
echo "🛑 Stopping existing containers..."
docker compose down

# Pull latest PostgreSQL image
echo "📥 Pulling latest PostgreSQL image..."
docker compose pull postgres

# Build and start the PostgreSQL container
echo "🏗️  Building and starting PostgreSQL container..."
docker compose up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
timeout=60
counter=0

while ! docker compose exec postgres pg_isready -U hemera_user -d hemera_db > /dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
        echo "❌ Timeout waiting for PostgreSQL to be ready"
        echo "🔍 Checking container logs..."
        docker compose logs postgres --tail=20
        exit 1
    fi
    echo "   Still waiting... ($counter/$timeout)"
    sleep 2
    counter=$((counter + 2))
done

echo "✅ PostgreSQL is ready!"

# Check if database is accessible
echo "🔍 Testing database connection..."
if docker compose exec postgres psql -U hemera_user -d hemera_db -c "SELECT version();" > /dev/null 2>&1; then
    echo "✅ Database connection successful!"
    
    # Get database info
    DB_VERSION=$(docker compose exec -T postgres psql -U hemera_user -d hemera_db -t -c "SELECT version();" | head -1 | sed 's/^ *//')
    echo "🔢 Database version: $DB_VERSION"
else
    echo "❌ Failed to connect to database"
    echo "🔍 Checking container logs..."
    docker compose logs postgres --tail=20
    exit 1
fi

# Create initial backup
echo "💾 Creating initial backup..."
./scripts/db-backup.sh > /dev/null 2>&1 || echo "⚠️  Could not create initial backup (this is normal for first setup)"

echo ""
echo "🎉 Database setup completed successfully!"
echo ""
echo "📊 Database Status:"
echo "   Container: RUNNING"
echo "   Database: hemera_db"
echo "   User: hemera_user"
echo "   Port: 5432"
echo ""
echo "📝 Next steps:"
echo "   1. Run 'npm run db:migrate' to apply database migrations"
echo "   2. Run 'npm run dev' to start the application"
echo ""
echo "🔧 Useful commands:"
echo "   - Check status: npm run db:status"
echo "   - Start database: npm run db:start"
echo "   - Stop database: npm run db:stop"
echo "   - Reset database: npm run db:reset"
echo "   - Create backup: npm run db:backup"
echo "   - Restore backup: npm run db:restore <backup_file>"
echo "   - View logs: docker compose logs postgres"
echo ""