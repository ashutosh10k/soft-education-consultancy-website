@echo off
title SOFT Education Consultancy - Web & Database Server
cls
echo ================================================================
echo        SOFT EDUCATION CONSULTANCY - LOCAL SERVER & DATABASE
echo ================================================================
echo.
echo Starting Python Backend Server on http://localhost:5000 ...
echo.

if exist "..\..\..\..\..\..\Program Files\Inkscape\bin\python.exe" (
    start "" "..\..\..\..\..\..\Program Files\Inkscape\bin\python.exe" server.py
) else (
    start "" python server.py
)

timeout /t 2 /nobreak >nul

echo.
echo Server is running!
echo Opening browser...
start http://localhost:5000/index.html
start http://localhost:5000/admin.html

echo.
echo - Website:         http://localhost:5000/index.html
echo - Admin Database:  http://localhost:5000/admin.html  (PIN: softadmin2026)
echo.
echo Close this window or the Python server window to stop the server.
pause
