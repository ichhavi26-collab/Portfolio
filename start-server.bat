@echo off
echo.
echo  ========================================
echo   Chhavi's Portfolio - Local Server
echo  ========================================
echo.
echo  Starting server at http://localhost:8000
echo  Press Ctrl+C to stop
echo.
start http://localhost:8000
python -m http.server 8000
pause
