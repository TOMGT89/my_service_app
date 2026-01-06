@echo off
setlocal enabledelayedexpansion
title AUTOVERS GT - INSTALLER

echo ======================================================
echo          AUTOVERS GT - ONE CLICK INSTALLER
echo ======================================================
echo.

:: Check for Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b
)

echo [1/4] Installing Root Dependencies...
call npm install --no-audit --no-fund

echo [2/4] Installing Admin Dependencies...
cd admin
call npm install --no-audit --no-fund
cd ..

echo [3/4] Installing Employee Dependencies...
cd employee
call npm install --no-audit --no-fund
cd ..

echo [4/4] Creating Desktop Shortcut...
set SCRIPT_PATH=%~dp0LAUNCH-AUTOVERS.bat
set ICON_PATH=%~dp0admin\public\favicon.ico
set SHORTCUT_NAME=AUTOVERS GT.lnk

powershell -Command "$s=(New-Object -COM WScript.Shell).CreateShortcut([System.IO.Path]::Combine([Environment]::GetFolderPath('Desktop'), '%SHORTCUT_NAME%'));$s.TargetPath='%SCRIPT_PATH%';$s.IconLocation='%ICON_PATH%';$s.Save()"

echo.
echo ======================================================
echo          SETUP COMPLETED SUCCESSFULLY!
echo ======================================================
echo You can now use the "AUTOVERS GT" icon on your Desktop.
echo.
pause
