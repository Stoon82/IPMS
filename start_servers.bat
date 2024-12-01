@echo off
echo Starting IPMS Development Servers...

:: Check if Python is installed
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Python is not installed or not in PATH
    pause
    exit /b 1
)

:: Check if Node.js is installed
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

:: Check if required directories exist
if not exist backend (
    echo Error: backend directory not found
    pause
    exit /b 1
)

if not exist frontend (
    echo Error: frontend directory not found
    pause
    exit /b 1
)

:: Start Backend Server
echo Starting backend server...
start cmd /k "cd backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

:: Wait a moment for backend to initialize
echo Waiting for backend to initialize...
timeout /t 10 /nobreak

:: Start Frontend Server
echo Starting frontend server...
start cmd /k "cd frontend && npm start"

echo.
echo Both servers are starting up...
echo Backend will be available at http://localhost:8000
echo Frontend will be available at http://localhost:3000
echo.
echo If you encounter any errors:
echo 1. Make sure all required Python packages are installed in backend
echo 2. Make sure all npm dependencies are installed in frontend
echo 3. Check if ports 8000 and 3000 are available
echo.
pause
