@echo off
chcp 65001 >nul
title Koltuk Ambar - onizleme
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo   Node.js bulunamadi.
  echo   Bu pencerede yazani Claude'a soyle.
  echo.
  pause
  exit /b
)

node onizleme-sunucu.js
echo.
echo   Onizleme kapandi.
pause
