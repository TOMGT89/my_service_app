@echo off
title AUTOVERS GT - LAUNCHER
echo ======================================================
echo          AUTOVERS GT - STARTING SYSTEM...
echo ======================================================

:: Start Backend Server
start "AUTOVERS-BACKEND" /min cmd /c "node server.js"

:: Start Anti-Sleep Pinger
start "AUTOVERS-PINGER" /min cmd /c "node utils/pinger.js"

:: Start Admin Panel
echo Starting Admin Panel...
cd admin
start "AUTOVERS-ADMIN" /min cmd /c "npm run dev"

:: Wait a few seconds then open browser
timeout /t 5 >nul
start http://localhost:5173

echo.
echo [SUCCESS] System is running! 
echo Keep this window open while working.
echo ======================================================
echo.
pause
