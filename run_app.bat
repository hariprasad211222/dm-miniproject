@echo off
title DMaut - AI Marketing Automation Server
cd /d "P:\Projects\ai-marketing-project"

echo ================================================================
echo   DMaut: AI-Enabled Marketing Automation & Campaign Optimizer
echo ================================================================
echo.

if exist "venv\Scripts\python.exe" (
    echo [OK] Using Python virtual environment: venv\Scripts\python.exe
    echo [OK] Launching Streamlit web application on port 8501...
    echo.
    "venv\Scripts\python.exe" -m streamlit run app.py --server.port 8501 --server.headless false
) else (
    echo [WARNING] venv not found, using system Python...
    python -m streamlit run app.py --server.port 8501 --server.headless false
)

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] An error occurred while running the server.
    pause
)
