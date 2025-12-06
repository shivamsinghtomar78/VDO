@echo off
echo Restarting AI Service with updated dependencies...

cd ai-service

echo Installing updated dependencies...
pip install -r requirements.txt

echo Starting AI service...
python main.py