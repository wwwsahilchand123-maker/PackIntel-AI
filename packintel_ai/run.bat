@echo off
setlocal enabledelayedexpansion

title PackIntel AI Launcher

echo ================================================================
echo           PackIntel AI - Intelligent Food Packaging
echo ================================================================
echo.

set "SCRIPT_DIR=%~dp0"
set "BACKEND_DIR=%SCRIPT_DIR%backend"
set "FRONTEND_DIR=%SCRIPT_DIR%frontend"
set "VENV_DIR=%BACKEND_DIR%\.venv"
set "PYTHON_EXE=%VENV_DIR%\Scripts\python.exe"

:: 1. Check Python
where python >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not found in system PATH.
    echo Please install Python 3.11+ and add it to PATH.
    pause
    goto :eof
)

:: 2. Check Node.js
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not found in system PATH.
    echo Please install Node.js 18+ and add it to PATH.
    pause
    goto :eof
)

:: 3. Check / Setup Python Virtual Environment (Isolated from PC)
if not exist "%PYTHON_EXE%" (
    echo [INFO] Setting up isolated Python virtual environment...
    python -m venv "%VENV_DIR%"
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment.
        pause
        goto :eof
    )
    echo [INFO] Installing backend dependencies...
    "%VENV_DIR%\Scripts\pip.exe" install -r "%BACKEND_DIR%\requirements.txt"
)

:: 4. Check / Setup Frontend Node Modules
if not exist "%FRONTEND_DIR%\node_modules" (
    echo [INFO] Installing frontend dependencies: npm install...
    cd /d "%FRONTEND_DIR%"
    call npm install
    cd /d "%SCRIPT_DIR%"
)

:: 5. Ensure .env files exist
if not exist "%BACKEND_DIR%\.env" (
    copy "%BACKEND_DIR%\.env.example" "%BACKEND_DIR%\.env" >nul
)
if not exist "%FRONTEND_DIR%\.env" (
    copy "%FRONTEND_DIR%\.env.example" "%FRONTEND_DIR%\.env" >nul
)

:: 6. Check Port Conflicts (Safe check - only warns, never kills other apps)
set "PORT_8000_BUSY="
for /f "tokens=4,5" %%a in ('netstat -ano ^| findstr :8000') do (
    if "%%a"=="LISTENING" set "PORT_8000_BUSY=%%b"
)

set "PORT_5173_BUSY="
for /f "tokens=4,5" %%a in ('netstat -ano ^| findstr :5173') do (
    if "%%a"=="LISTENING" set "PORT_5173_BUSY=%%b"
)

if defined PORT_8000_BUSY (
    echo [WARN] Port 8000 is currently in use by PID !PORT_8000_BUSY!.
    echo If PackIntel backend is already running, you can continue.
)

if defined PORT_5173_BUSY (
    echo [WARN] Port 5173 is currently in use by PID !PORT_5173_BUSY!.
    echo If PackIntel frontend is already running, you can continue.
)

echo.
echo [1/2] Starting Backend Server: FastAPI on http://localhost:8000
start "PackIntel AI - Backend (Port 8000)" cmd /k "cd /d "%BACKEND_DIR%" && call "%VENV_DIR%\Scripts\activate.bat" && uvicorn main:app --host 127.0.0.1 --port 8000"

:: Wait 3 seconds for backend to spin up
ping 127.0.0.1 -n 4 >nul

echo [2/2] Starting Frontend Server: Vite React on http://localhost:5173
start "PackIntel AI - Frontend (Port 5173)" cmd /k "cd /d "%FRONTEND_DIR%" && npm run dev"

:: Wait 2 seconds and open browser
ping 127.0.0.1 -n 3 >nul
echo.
echo ================================================================
echo [SUCCESS] PackIntel AI is running!
echo.
echo - Frontend Web UI:  http://localhost:5173
echo - Backend API Docs: http://localhost:8000/api/docs
echo.
echo Note: To stop PackIntel AI without affecting any other apps
echo on your PC, run 'stop.bat'.
echo ================================================================
echo.

start http://localhost:5173

endlocal
