@echo off
echo === DAKL Frontend Local Build & Test ===

echo Building the application...
call npm run build
if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b 1
)

echo Build completed successfully!
echo Starting local preview...
call npx vite preview --port 4590
