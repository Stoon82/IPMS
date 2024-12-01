@echo off
echo Cleaning up model structure...

:: Remove old models directory if it exists
if exist backend\models (
    echo Removing old models directory...
    rmdir /S /Q backend\models
)

:: Remove any .pyc files that might cause import issues
del /S /Q backend\app\models\*.pyc 2>nul
del /S /Q backend\app\models\__pycache__\*.pyc 2>nul

echo Cleanup complete!
pause 