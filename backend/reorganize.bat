@echo off
echo Starting model reorganization...

:: Create backup directory
mkdir backend\models_backup 2>nul
echo Created backup directory

:: Backup existing models
xcopy /E /I /Y backend\models\* backend\models_backup\
echo Backed up existing models

:: Ensure app/models directory exists
mkdir backend\app\models 2>nul
echo Created app/models directory

:: Copy models to new location
xcopy /E /I /Y backend\models\* backend\app\models\
echo Copied models to new location

:: Remove old models directory (but keep backup)
rmdir /S /Q backend\models
echo Removed old models directory

echo Model reorganization complete!
echo Backup of old models is in backend\models_backup
pause 