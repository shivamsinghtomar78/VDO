@echo off
echo.
echo ╔════════════════════════════════════════╗
echo ║  Video-to-Blog AI Converter            ║
echo ║  Starting All Services...              ║
echo ╚════════════════════════════════════════╝
echo.

echo Checking prerequisites...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js 18+
    pause
    exit /b 1
)

python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found. Please install Python 3.10+
    pause
    exit /b 1
)

echo ✅ Prerequisites OK
echo.

echo 📦 Starting Backend (Port 5000)...
start "VideoBlog Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul

echo 🤖 Starting AI Service (Port 8000)...
start "VideoBlog AI Service" cmd /k "cd ai-service && python simple_main.py"
timeout /t 3 /nobreak >nul

echo 🎨 Starting Frontend (Port 5173)...
start "VideoBlog Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ╔════════════════════════════════════════╗
echo ║  ✨ All Services Starting!             ║
echo ╠════════════════════════════════════════╣
echo ║  Frontend:   http://localhost:5173    ║
echo ║  Backend:    http://localhost:5000    ║
echo ║  AI Service: http://localhost:8000    ║
echo ╠════════════════════════════════════════╣
echo ║  Open http://localhost:5173 now       ║
echo ║  Press Ctrl+C in each window to stop  ║
echo ╚════════════════════════════════════════╝
echo.
echo Waiting for services to start...
timeout /t 5 /nobreak >nul
echo.
echo 🌐 Opening browser...
start http://localhost:5173
