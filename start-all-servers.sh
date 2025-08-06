#!/bin/bash

echo "🚀 Starting all servers..."

# Kill any existing processes
pkill -f "api-server.js" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Wait a moment
sleep 2

# Start API server in background
echo "📡 Starting API server..."
cd backend
nohup npm run api > ../api-server.log 2>&1 &
API_PID=$!
cd ..

# Wait for API server to start
sleep 3

# Start frontend server in background
echo "🌐 Starting frontend server..."
nohup npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for servers to start
sleep 5

echo "✅ Servers started!"
echo "📡 API Server PID: $API_PID"
echo "🌐 Frontend Server PID: $FRONTEND_PID"

# Check if servers are running
echo ""
echo "🔍 Checking server status..."

if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ API Server: Running on http://localhost:3001"
else
    echo "❌ API Server: Not responding"
fi

if curl -s http://localhost:8080 > /dev/null 2>&1; then
    echo "✅ Frontend Server: Running on http://localhost:8080"
elif curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "✅ Frontend Server: Running on http://localhost:5173"
else
    echo "❌ Frontend Server: Not responding"
fi

echo ""
echo "🎯 Access the application:"
echo "   Frontend: http://localhost:8080 or http://localhost:5173"
echo "   API: http://localhost:3001/api/health"
echo ""
echo "📊 To check logs:"
echo "   API: tail -f api-server.log"
echo "   Frontend: tail -f frontend.log"