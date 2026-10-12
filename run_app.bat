@echo off
echo ========================================================
echo   DMAUT AI - Marketing Automation & Campaign Platform
echo ========================================================
echo.
echo Starting Backend API on http://localhost:5000 ...
start "DMAUT Backend (Port 5000)" cmd /k "cd backend && npm start"

timeout /t 2 /nobreak >nul

echo Starting Frontend on http://localhost:5173 ...
start "DMAUT Frontend (Port 5173)" cmd /k "cd frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo Opening browser at http://localhost:5173 ...
start http://localhost:5173

echo.
echo DMAUT AI is up and running!
echo Close the opened terminal windows to stop the servers.
pause
