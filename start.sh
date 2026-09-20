#!/usr/bin/env bash
set -u

ROOT="/home/stas/Desktop/conflict-map"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"
LOG="$ROOT/launch.log"

mkdir -p "$ROOT"

log() { echo "[$(date '+%H:%M:%S')] $*" | tee -a "$LOG"; }

# 1. Backend
if curl -sf http://localhost:8000/api/geojson/ >/dev/null 2>&1; then
  log "Backend: уже запущен (порт 8000)"
else
  log "Backend: запускаю..."
  (cd "$BACKEND" && source venv/bin/activate && nohup python manage.py runserver 0.0.0.0:8000) >>"$LOG" 2>&1 &
  disown
  for i in $(seq 1 20); do
    curl -sf http://localhost:8000/api/geojson/ >/dev/null 2>&1 && break
    sleep 1
  done
  if curl -sf http://localhost:8000/api/geojson/ >/dev/null 2>&1; then
    log "Backend: готов"
  else
    log "Backend: НЕ удалось запустить — см. $LOG"
  fi
fi

# 2. Frontend
if curl -sf http://localhost:5173 >/dev/null 2>&1; then
  log "Frontend: уже запущен (порт 5173)"
else
  log "Frontend: запускаю..."
  (cd "$FRONTEND" && exec npm run dev -- --host 0.0.0.0) >>"$LOG" 2>&1 &
  for i in $(seq 1 30); do
    curl -sf http://localhost:5173 >/dev/null 2>&1 && break
    sleep 1
  done
  if curl -sf http://localhost:5173 >/dev/null 2>&1; then
    log "Frontend: готов"
  else
    log "Frontend: НЕ удалось запустить — см. $LOG"
  fi
fi

# 3. Browser
log "Открываю браузер: http://localhost:5173"
if command -v xdg-open >/dev/null 2>&1; then
  xdg-open http://localhost:5173 >/dev/null 2>&1 &
else
  log "xdg-open не найден — откройте вручную"
fi

log "Готово. Страница: http://localhost:5173"