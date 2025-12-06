#!/bin/bash

echo "Starting VDO Application..."

# Navigate to ai-service directory
cd ai-service

# Create Python virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment and install dependencies
echo "Installing Python dependencies..."
source venv/bin/activate
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
