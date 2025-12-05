#!/bin/bash
# Quick startup script for development

echo "🚀 Starting Video-to-Blog AI Converter..."
echo ""

# Start backend
echo "📦 Starting Backend (Port 5000)..."
cd backend
npm install > /dev/null 2>&1
npm run dev &
BACKEND_PID=$!
echo "✓ Backend started (PID: $BACKEND_PID)"

# Start AI service
echo "🤖 Starting AI Service (Port 8000)..."
cd ../ai-service
python -m venv venv 2>/dev/null
source venv/bin/activate
pip install -q -r requirements.txt
python main.py &
SERVICE_PID=$!
echo "✓ AI Service started (PID: $SERVICE_PID)"

# Start frontend
echo "🎨 Starting Frontend (Port 3000)..."
cd ../frontend
npm install > /dev/null 2>&1
npm run dev &
FRONTEND_PID=$!
echo "✓ Frontend started (PID: $FRONTEND_PID)"

echo ""
echo "════════════════════════════════════════"
echo "✨ All services started!"
echo ""
echo "Frontend:   http://localhost:3000"
echo "Backend:    http://localhost:5000"
echo "AI Service: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop all services"
echo "════════════════════════════════════════"

# Wait for all processes
wait
