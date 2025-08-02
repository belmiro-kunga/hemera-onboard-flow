#!/bin/bash

# Prerequisites check script for Hemera project
# This script checks if all required tools are installed and configured

set -e

echo "🔍 Checking prerequisites for Hemera project..."

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check version
check_version() {
    local cmd="$1"
    local version_cmd="$2"
    local min_version="$3"
    
    if command_exists "$cmd"; then
        local current_version=$($version_cmd 2>/dev/null | head -1)
        echo "   ✅ $cmd: $current_version"
        return 0
    else
        echo "   ❌ $cmd: Not installed"
        return 1
    fi
}

# Initialize counters
ERRORS=0
WARNINGS=0

# Check Docker
echo "🐳 Docker:"
if check_version "docker" "docker --version" "20.0"; then
    # Check if Docker daemon is running
    if docker info >/dev/null 2>&1; then
        echo "   ✅ Docker daemon is running"
        
        # Check Docker permissions
        if docker ps >/dev/null 2>&1; then
            echo "   ✅ Docker permissions are correct"
        else
            echo "   ⚠️  Docker permission issues detected"
            echo "   💡 You may need to add your user to the docker group:"
            echo "      sudo usermod -aG docker $USER"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo "   ❌ Docker daemon is not running"
        echo "   💡 Start Docker Desktop or run: sudo systemctl start docker"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo "   💡 Install Docker: https://docs.docker.com/get-docker/"
    ERRORS=$((ERRORS + 1))
fi

# Check Docker Compose
echo ""
echo "🔧 Docker Compose:"
if check_version "docker-compose" "docker-compose --version" "1.29"; then
    echo "   ✅ Docker Compose (standalone) is available"
elif docker compose version >/dev/null 2>&1; then
    echo "   ✅ Docker Compose (plugin) is available"
    echo "   📝 Version: $(docker compose version)"
else
    echo "   ❌ Docker Compose not found"
    echo "   💡 Docker Compose should be included with Docker Desktop"
    ERRORS=$((ERRORS + 1))
fi

# Check Node.js
echo ""
echo "📦 Node.js:"
if check_version "node" "node --version" "18.0"; then
    NODE_VERSION=$(node --version | sed 's/v//')
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d. -f1)
    if [ "$MAJOR_VERSION" -ge 18 ]; then
        echo "   ✅ Node.js version is compatible (v$NODE_VERSION)"
    else
        echo "   ⚠️  Node.js version should be 18 or higher (current: v$NODE_VERSION)"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "   💡 Install Node.js 18+: https://nodejs.org/"
    ERRORS=$((ERRORS + 1))
fi

# Check npm
echo ""
echo "📦 npm:"
if check_version "npm" "npm --version" "8.0"; then
    NPM_VERSION=$(npm --version)
    echo "   ✅ npm is available (v$NPM_VERSION)"
else
    echo "   💡 npm should be included with Node.js"
    ERRORS=$((ERRORS + 1))
fi

# Check tsx (TypeScript executor)
echo ""
echo "🔧 tsx:"
if command_exists "tsx"; then
    TSX_VERSION=$(tsx --version 2>/dev/null || echo "unknown")
    echo "   ✅ tsx: Available ($TSX_VERSION)"
else
    echo "   ❌ tsx: Not installed"
    echo "   💡 Install with: npm install -g tsx"
    ERRORS=$((ERRORS + 1))
fi

# Check Git
echo ""
echo "📝 Git:"
if check_version "git" "git --version" "2.0"; then
    echo "   ✅ Git is available"
else
    echo "   💡 Install Git: https://git-scm.com/"
    WARNINGS=$((WARNINGS + 1))
fi

# Check project files
echo ""
echo "⚙️  Project Configuration:"

# Check .env file
if [ -f ".env" ]; then
    echo "   ✅ .env file exists"
    
    # Check required environment variables
    if grep -q "DB_HOST" .env && grep -q "DB_PORT" .env && grep -q "DB_NAME" .env; then
        echo "   ✅ Database configuration found in .env"
    else
        echo "   ⚠️  Database configuration incomplete in .env"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "   ⚠️  .env file not found"
    if [ -f ".env.example" ]; then
        echo "   💡 Copy .env.example to .env and configure"
    else
        echo "   💡 Create .env file with database configuration"
    fi
    WARNINGS=$((WARNINGS + 1))
fi

# Check docker-compose.yml
if [ -f "docker-compose.yml" ]; then
    echo "   ✅ docker-compose.yml exists"
else
    echo "   ❌ docker-compose.yml not found"
    ERRORS=$((ERRORS + 1))
fi

# Check package.json
if [ -f "package.json" ]; then
    echo "   ✅ package.json exists"
    
    # Check if node_modules exists
    if [ -d "node_modules" ]; then
        echo "   ✅ node_modules directory exists"
    else
        echo "   ⚠️  node_modules not found"
        echo "   💡 Run 'npm install' to install dependencies"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "   ❌ package.json not found"
    ERRORS=$((ERRORS + 1))
fi

# Check database directory structure
echo ""
echo "🗄️  Database Structure:"
if [ -d "database" ]; then
    echo "   ✅ database directory exists"
    
    if [ -d "database/migrations" ]; then
        MIGRATION_COUNT=$(find database/migrations -name "*.sql" 2>/dev/null | wc -l)
        echo "   ✅ migrations directory exists ($MIGRATION_COUNT files)"
    else
        echo "   ⚠️  migrations directory not found"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    if [ -d "database/init" ]; then
        echo "   ✅ init directory exists"
    else
        echo "   ⚠️  init directory not found"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "   ⚠️  database directory not found"
    WARNINGS=$((WARNINGS + 1))
fi

# Check scripts directory
echo ""
echo "🔧 Scripts:"
SCRIPT_DIR="scripts"
if [ -d "$SCRIPT_DIR" ]; then
    echo "   ✅ scripts directory exists"
    
    REQUIRED_SCRIPTS=("db-setup.sh" "db-start.sh" "db-stop.sh" "db-migrate.sh")
    for script in "${REQUIRED_SCRIPTS[@]}"; do
        if [ -f "$SCRIPT_DIR/$script" ]; then
            if [ -x "$SCRIPT_DIR/$script" ]; then
                echo "   ✅ $script (executable)"
            else
                echo "   ⚠️  $script (not executable)"
                echo "   💡 Run: chmod +x $SCRIPT_DIR/$script"
                WARNINGS=$((WARNINGS + 1))
            fi
        else
            echo "   ❌ $script not found"
            ERRORS=$((ERRORS + 1))
        fi
    done
else
    echo "   ❌ scripts directory not found"
    ERRORS=$((ERRORS + 1))
fi

# System resources check
echo ""
echo "💻 System Resources:"
if command_exists "free"; then
    MEMORY_GB=$(free -g | awk '/^Mem:/{print $2}')
    if [ "$MEMORY_GB" -ge 4 ]; then
        echo "   ✅ Memory: ${MEMORY_GB}GB (sufficient)"
    else
        echo "   ⚠️  Memory: ${MEMORY_GB}GB (recommended: 4GB+)"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

if command_exists "df"; then
    DISK_SPACE=$(df -BG . | awk 'NR==2{print $4}' | sed 's/G//')
    if [ "$DISK_SPACE" -ge 5 ]; then
        echo "   ✅ Disk space: ${DISK_SPACE}GB available"
    else
        echo "   ⚠️  Disk space: ${DISK_SPACE}GB (recommended: 5GB+)"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# Check available ports
echo ""
echo "🌐 Network:"
if command_exists "netstat"; then
    if netstat -tuln 2>/dev/null | grep -q ':5432 '; then
        echo "   ⚠️  Port 5432 is already in use"
        echo "   💡 You may need to stop other PostgreSQL instances"
        WARNINGS=$((WARNINGS + 1))
    else
        echo "   ✅ Port 5432 is available"
    fi
elif command_exists "ss"; then
    if ss -tuln 2>/dev/null | grep -q ':5432 '; then
        echo "   ⚠️  Port 5432 is already in use"
        echo "   💡 You may need to stop other PostgreSQL instances"
        WARNINGS=$((WARNINGS + 1))
    else
        echo "   ✅ Port 5432 is available"
    fi
else
    echo "   ⚠️  Cannot check port availability (netstat/ss not found)"
    WARNINGS=$((WARNINGS + 1))
fi

# Summary
echo ""
echo "🎯 Summary:"
echo "==========="

if [ "$ERRORS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
    echo "✅ All prerequisites are met! System is ready."
    echo ""
    echo "🚀 Next steps:"
    echo "   1. Run 'npm install' (if not done already)"
    echo "   2. Run 'npm run db:setup' to setup database"
    echo "   3. Run 'npm run db:migrate' to apply migrations"
    echo "   4. Run 'npm run dev' to start development"
    exit 0
elif [ "$ERRORS" -eq 0 ]; then
    echo "⚠️  System is mostly ready with $WARNINGS warnings"
    echo "💡 Address warnings above for optimal experience"
    echo ""
    echo "🚀 You can proceed with:"
    echo "   1. npm install"
    echo "   2. npm run db:setup"
    exit 0
else
    echo "❌ Found $ERRORS critical errors and $WARNINGS warnings"
    echo "💡 Please resolve critical errors before proceeding"
    echo ""
    echo "🔧 Common solutions:"
    echo "   - Install missing tools (Docker, Node.js, tsx)"
    echo "   - Start Docker daemon"
    echo "   - Run 'npm install' to install dependencies"
    echo "   - Copy .env.example to .env"
    exit 1
fi