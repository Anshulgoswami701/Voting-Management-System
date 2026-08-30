@echo off
REM Voting Management System - Quick Start Script

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  🗳️  VOTING MANAGEMENT SYSTEM - QUICK START              ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check if Terminal/PowerShell is available
where pwsh >nul 2>&1
if %errorlevel% == 0 (
    echo Opening Backend Server...
    start pwsh -NoExit -Command "cd Backend; node server.js"
    echo ✓ Backend server starting on http://localhost:5000
    echo.
)

echo Opening Frontend Application...
start pwsh -NoExit -Command "cd Frontend\voteapp; npm run dev"
echo ✓ Frontend server starting on http://localhost:5173
echo.

echo ╔════════════════════════════════════════════════════════════╗
echo ║  🚀 SYSTEM STARTING UP...                                 ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Waiting for servers to initialize (30 seconds)...
timeout /t 30 /nobreak

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  ✅ SYSTEM READY!                                         ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 🌐 Frontend:  http://localhost:5173
echo 🔌 Backend:   http://localhost:5000
echo.
echo 👤 TEST CREDENTIALS:
echo    Admin Email: e2eadmin1788079188931@example.com
echo    Password: Pass1234
echo    Admin Secret: ADMIN@12345
echo.
echo 📖 For detailed instructions, see DEPLOYMENT_GUIDE.md
echo.
pause
