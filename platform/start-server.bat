@echo off
echo Starting local server. Open in browser: http://localhost:8080
echo Press Ctrl+C to stop.
cd /d "%~dp0"
python -m http.server 8080 2>nul || npx -y serve -p 8080
pause
