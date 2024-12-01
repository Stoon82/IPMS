@echo off
mkdir backend\app\models 2>nul
move backend\models\*.py backend\app\models\
rmdir backend\models 