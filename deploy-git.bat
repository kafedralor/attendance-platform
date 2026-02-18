@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist .git git init
git add .
git status
git commit -m "Платформа посещаемости" 2>nul || git commit -m "Платформа посещаемости"
echo.
echo Done. Add remote and push:
echo   git remote add origin https://github.com/YOUR_USERNAME/attendance-platform.git
echo   git branch -M main
echo   git push -u origin main
pause
