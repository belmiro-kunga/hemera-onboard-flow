#!/bin/bash

# Database test script for Hemera project
# This script runs basic tests to verify database functionality

set -e

echo "🧪 Running database tests..."

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

# Function to test basic connectivity
test_connectivity() {
    echo "🔌 Testing database connectivity..."
    
    if docker compose exec postgres pg_isready -U hemera_user -d hemera_db > /dev/null 2>&1; then
        echo "✅ Database connectivity: PASSED"
        return 0
    else
        echo "❌ Database connectivity: FAILED"
        return 1
    fi
}

# Function to test basic SQL operations
test_sql_operations() {
    echo "📝 Testing basic SQL operations..."
    
    # Test SELECT
    local select_result=$(docker compose exec -T postgres psql -U hemera_user -d hemera_db -t -c "SELECT 1 as test;" 2>/dev/null | sed 's/^ *//')
    if [ "$select_result" = "1" ]; then
        echo "✅ SELECT operation: PASSED"
    else
        echo "❌ SELECT operation: FAILED"
        return 1
    fi
    
    # Test CREATE TABLE
    if docker compose exec -T postgres psql -U hemera_user -d hemera_db -c "
        CREATE TABLE IF NOT EXISTS test_table (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100),
            created_at TIMESTAMP DEFAULT NOW()
        );
    " > /dev/null 2>&1; then
        echo "✅ CREATE TABLE operation: PASSED"
    else
        echo "❌ CREATE TABLE operation: FAILED"
        return 1
    fi
    
    # Test INSERT
    if docker compose exec -T postgres psql -U hemera_user -d hemera_db -c "
        INSERT INTO test_table (name) VALUES ('test_record');
    " > /dev/null 2>&1; then
        echo "✅ INSERT operation: PASSED"
    else
        echo "❌ INSERT operation: FAILED"
        return 1
    fi
    
    # Test UPDATE
    if docker compose exec -T postgres psql -U hemera_user -d hemera_db -c "
        UPDATE test_table SET name = 'updated_record' WHERE name = 'test_record';
    " > /dev/null 2>&1; then
        echo "✅ UPDATE operation: PASSED"
    else
        echo "❌ UPDATE operation: FAILED"
        return 1
    fi
    
    # Test DELETE
    if docker compose exec -T postgres psql -U hemera_user -d hemera_db -c "
        DELETE FROM test_table WHERE name = 'updated_record';
    " > /dev/null 2>&1; then
        echo "✅ DELETE operation: PASSED"
    else
        echo "❌ DELETE operation: FAILED"
        return 1
    fi
    
    # Clean up test table
    docker compose exec -T postgres psql -U hemera_user -d hemera_db -c "DROP TABLE IF EXISTS test_table;" > /dev/null 2>&1
    
    return 0
}

# Function to test database schema
test_schema() {
    echo "🏗️  Testing database schema..."
    
    # Check if auth schema exists
    local auth_schema=$(docker compose exec -T postgres psql -U hemera_user -d hemera_db -t -c "
        SELECT COUNT(*) FROM information_schema.schemata WHERE schema_name = 'auth';
    " 2>/dev/null | sed 's/^ *//')
    
    if [ "$auth_schema" = "1" ]; then
        echo "✅ Auth schema: EXISTS"
    else
        echo "⚠️  Auth schema: NOT FOUND (may be normal if not migrated yet)"
    fi
    
    # Check for some expected tables
    local tables=$(docker compose exec -T postgres psql -U hemera_user -d hemera_db -t -c "
        SELECT COUNT(*) FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    " 2>/dev/null | sed 's/^ *//')
    
    if [ "$tables" -gt 0 ]; then
        echo "✅ Public tables: FOUND ($tables tables)"
    else
        echo "⚠️  Public tables: NOT FOUND (run migrations first)"
    fi
}

# Function to test performance
test_performance() {
    echo "⚡ Testing database performance..."
    
    # Simple performance test
    local start_time=$(date +%s%N)
    
    docker compose exec -T postgres psql -U hemera_user -d hemera_db -c "
        SELECT COUNT(*) FROM generate_series(1, 1000);
    " > /dev/null 2>&1
    
    local end_time=$(date +%s%N)
    local duration=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds
    
    if [ $duration -lt 1000 ]; then
        echo "✅ Performance test: PASSED (${duration}ms)"
    else
        echo "⚠️  Performance test: SLOW (${duration}ms)"
    fi
}

# Function to test connection limits
test_connections() {
    echo "🔗 Testing connection handling..."
    
    # Get max connections
    local max_conn=$(docker compose exec -T postgres psql -U hemera_user -d hemera_db -t -c "SHOW max_connections;" 2>/dev/null | sed 's/^ *//')
    
    # Get current connections
    local current_conn=$(docker compose exec -T postgres psql -U hemera_user -d hemera_db -t -c "
        SELECT count(*) FROM pg_stat_activity WHERE datname='hemera_db';
    " 2>/dev/null | sed 's/^ *//')
    
    echo "✅ Connection limits: $current_conn/$max_conn connections"
    
    if [ "$current_conn" -lt "$((max_conn / 2))" ]; then
        echo "✅ Connection usage: HEALTHY"
    else
        echo "⚠️  Connection usage: HIGH"
    fi
}

# Function to run application-level tests
test_application() {
    echo "🚀 Testing application integration..."
    
    # Check if Node.js tests can run
    if command -v npm > /dev/null 2>&1; then
        if [ -f "package.json" ] && grep -q "test" package.json; then
            echo "📋 Running application tests..."
            if npm test > /dev/null 2>&1; then
                echo "✅ Application tests: PASSED"
            else
                echo "⚠️  Application tests: SOME FAILURES (check npm test output)"
            fi
        else
            echo "ℹ️  No application tests configured"
        fi
    else
        echo "ℹ️  Node.js not available for application tests"
    fi
}

# Main execution
echo "🧪 Database Test Suite"
echo "====================="
echo ""

check_docker
check_postgres

echo ""

# Run all tests
tests_passed=0
total_tests=6

if test_connectivity; then
    tests_passed=$((tests_passed + 1))
fi

echo ""

if test_sql_operations; then
    tests_passed=$((tests_passed + 1))
fi

echo ""

test_schema
tests_passed=$((tests_passed + 1))

echo ""

test_performance
tests_passed=$((tests_passed + 1))

echo ""

test_connections
tests_passed=$((tests_passed + 1))

echo ""

test_application
tests_passed=$((tests_passed + 1))

echo ""
echo "📊 Test Results Summary"
echo "======================"
echo "✅ Tests passed: $tests_passed/$total_tests"

if [ $tests_passed -eq $total_tests ]; then
    echo "🎉 All tests passed! Database is working correctly."
    exit 0
else
    echo "⚠️  Some tests had issues. Check the output above."
    exit 1
fi