@echo off
REM English Fantasy - Local Development Server Starter (Windows)
REM This script helps start a local web server for development

echo.
echo 🎮 English Fantasy - Development Server
echo ========================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo 🐍 Starting with Python...
    cd /d "%~dp0"
    python -m http.server 8000 --directory src
    echo ✅ Server running at: http://localhost:8000/html/index.html
    pause
    exit /b 0
)

REM Check if Python 3 is available
python3 --version >nul 2>&1
if %errorlevel% equ 0 (
    echo 🐍 Starting with Python 3...
    cd /d "%~dp0"
    python3 -m http.server 8000 --directory src
    echo ✅ Server running at: http://localhost:8000/html/index.html
    pause
    exit /b 0
)

REM Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo 📦 Starting with Node.js http-server...
    cd /d "%~dp0"
    npx http-server src -p 8000 -c-1
    echo ✅ Server running at: http://localhost:8000/html/index.html
    pause
    exit /b 0
)

REM If we reach here, no suitable server was found
echo ❌ No suitable server found!
echo.
echo Please install one of:
echo   - Python 3.x (recommended)
echo   - Python 2.x
echo   - Node.js
echo.
pause
exit /b 1
