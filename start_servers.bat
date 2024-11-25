@echo off
echo Starting IPMS Development Servers...

:: Start Backend Server
start cmd /k "cd backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

:: Wait a moment for backend to initialize
timeout /t 5

:: Start Frontend Server
start cmd /k "cd frontend && npm start"

echo Both servers are starting up...
echo Backend will be available at http://localhost:8000
echo Frontend will be available at http://localhost:3000
