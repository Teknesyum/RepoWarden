@echo off
where node >nul 2>nul || (echo Node.js is required: https://nodejs.org & pause & exit /b 1)
node "%~dp0bin\repowarden.mjs" %*
if "%~1"=="" pause