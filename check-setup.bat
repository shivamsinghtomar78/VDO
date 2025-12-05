@echo off
echo.
echo ========================================
echo   Project Setup Verification
echo ========================================
echo.

echo Checking Node.js...
node --version
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js 18+
    pause
    exit /b 1
)
echo ✅ Node.js found

echo.
echo Checking Python...
python --version
if errorlevel 1 (
    echo ❌ Python not found. Please install Python 3.10+
    pause
    exit /b 1
)
echo ✅ Python found

echo.
echo Checking Backend dependencies...
cd backend
if not exist node_modules (
    echo Installing backend dependencies...
    call npm install
) else (
    echo ✅ Backend dependencies installed
)
cd ..

echo.
echo Checking Frontend dependencies...
cd frontend
if not exist node_modules (
    echo Installing frontend dependencies...
    call npm install
) else (
    echo ✅ Frontend dependencies installed
)
cd ..

echo.
echo Checking AI Service virtual environment...
cd ai-service
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
    call venv\Scripts\activate
    pip install -r requirements.txt
) else (
    echo ✅ Virtual environment exists
)
cd ..

echo.
echo ========================================
echo   ✅ Setup Verification Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Run: start.bat
echo 2. Open: http://localhost:5173
echo.
pause
