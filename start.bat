@echo off 2>nul
goto :win 2>nul
# ===== Linux (bash) =====
rm -f "$(dirname "$0")/nul" "$(dirname "$0")/dev" 2>/dev/null
exec /bin/bash /home/stas/Desktop/conflict-map/start.sh

:win
setlocal
chcp 65001 >nul
title Карта вооружённых конфликтов
set ROOT=%~dp0
cd /d "%ROOT%"

where python >nul 2>nul || (echo python не найден в PATH^). Установите Python 3.10+ и поставьте галочку "Add to PATH". & pause & exit /b 1)

echo [1/3] Запуск backend (Django) на порту 8000...
start "backend" cmd /k "cd /d "%ROOT%backend" && python -m pip install -r requirements.txt && python manage.py runserver 0.0.0.0:8000"

echo [2/3] Запуск frontend (Vite) на порту 5173...
start "frontend" cmd /k "cd /d "%ROOT%frontend" && npm install && npm run dev -- --host 0.0.0.0"

echo [3/3] Жду запуска и открываю браузер...
set /a cnt=0
:wait
set /a cnt+=1
if %cnt% GTR 60 (echo Серверы не поднялись за 60 сек. Смотрите окна backend/frontend. & goto :open)
powershell -Command "try{\$r=Invoke-WebRequest -UseBasicParsing 'http://localhost:5173' -TimeoutSec 1; exit 0}catch{exit 1}" >nul 2>nul
if errorlevel 1 goto :wait
:open
start http://localhost:5173
echo Готово. Окна backend/frontend не закрывайте.
endlocal