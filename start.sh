#!/bin/bash

echo "Starting VDO Application..."

# Install Python dependencies
echo "Installing Python dependencies..."
cd ai-service
pip install -r requirements.txt

# Start Python AI service in background
echo "Starting Python AI service on port 8000..."
python main.py &
AI_PID=$!

# Wait for AI service to start
sleep 3

# Go back to root and start Node.js backend
cd ..
echo "Starting Node.js backend..."
cd backend
npm start
