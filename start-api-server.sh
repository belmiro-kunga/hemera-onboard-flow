#!/bin/bash
cd backend
echo "🚀 Starting API server..."
nohup node api-server.js > ../api-server.log 2>&1 &
echo "✅ API server started in background"
echo "📊 Check logs with: tail -f api-server.log"