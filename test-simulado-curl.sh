#!/bin/bash

echo "🔄 Testing simulado creation with curl..."

# Create test simulado
curl -X POST http://localhost:3001/api/simulados \
  -H "Content-Type: application/json" \
  -d '{
    "simulado": {
      "title": "Test Simulado via Curl",
      "description": "Test simulado created via curl",
      "duration_minutes": 30,
      "total_questions": 2,
      "difficulty": "facil",
      "is_active": true
    },
    "questions": [
      {
        "text": "What is 2 + 2?",
        "type": "multiple_choice",
        "explanation": "Basic math addition",
        "order_number": 1,
        "options": [
          { "text": "3", "is_correct": false, "order_number": 1 },
          { "text": "4", "is_correct": true, "order_number": 2 },
          { "text": "5", "is_correct": false, "order_number": 3 }
        ]
      }
    ]
  }'

echo -e "\n\n🔄 Fetching all simulados..."
curl -s http://localhost:3001/api/simulados