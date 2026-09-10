@echo off
setlocal enabledelayedexpansion

title PackIntel AI - Stop

echo ================================================================
echo           Stopping PackIntel AI (Safe Port Cleanup)
echo ================================================================
echo.
echo [INFO] Looking for PackIntel processes on ports 8000 and 5173...
echo Note: Other Python/Node projects on your PC will NOT be touched.
echo.

set "KILLED=0"

for /f "tokens=4,5" %%a in ('netstat -ano ^| findstr :8000') do (
    if "%%a"=="LISTENING" (
        echo [INFO] Stopping PackIntel Backend: PID %%b on port 8000
        taskkill /f /pid %%b >nul 2>&1
        set "KILLED=1"
    )
)

for /f "tokens=4,5" %%a in ('netstat -ano ^| findstr :5173') do (
    if "%%a"=="LISTENING" (
        echo [INFO] Stopping PackIntel Frontend: PID %%b on port 5173
        taskkill /f /pid %%b >nul 2>&1
        set "KILLED=1"
    )
)

if "!KILLED!"=="1" (
    echo.
    echo [SUCCESS] PackIntel AI stopped cleanly.
) else (
    echo [INFO] No active PackIntel process found on port 8000 or 5173.
)

echo.
ping 127.0.0.1 -n 3 >nul
endlocal
