"""Лаунчер десктоп-версии «Карта конфликтов» для Windows .exe.

- Запускает Django + встроенный frontend (Vite build) на http://127.0.0.1:8000
- Открывает браузер
- БД берётся рядом с .exe (копируется из бандла при первом запуске — логика в settings.py)
"""
import os
import sys
import threading
import time
import webbrowser
from pathlib import Path

# Определяем пути для frozen / dev
if getattr(sys, 'frozen', False):
    BUNDLE_DIR = Path(getattr(sys, '_MEIPASS', Path(__file__).resolve().parent))
    APP_DIR = Path(sys.executable).resolve().parent
    BASE_DIR = BUNDLE_DIR
    # manage.py лежит в bundle root (мы кладём backend/* в корень бандла через --add-data + hidden imports)
    sys.path.insert(0, str(BUNDLE_DIR))
else:
    BASE_DIR = Path(__file__).resolve().parent
    APP_DIR = BASE_DIR
    sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'conflict_map.settings')

import django  # noqa: E402
from django.core.management import call_command  # noqa: E402
from django.core.wsgi import get_wsgi_application  # noqa: E402

PORT = int(os.environ.get('CONFLICT_MAP_PORT', '8000'))
HOST = '127.0.0.1'
URL = f'http://{HOST}:{PORT}/'


def ensure_db():
    # migrate на случай если БД рядом с exe пустая/старая
    try:
        call_command('migrate', '--noinput', verbosity=0)
    except Exception as e:
        print(f'[warn] migrate failed: {e}')


def open_browser_delayed(delay=1.5):
    def _open():
        time.sleep(delay)
        try:
            webbrowser.open(URL)
        except Exception as e:
            print(f'[warn] cannot open browser: {e}')
    threading.Thread(target=_open, daemon=True).start()


def main():
    django.setup()
    ensure_db()
    # collectstatic не обязателен: WhiteNoise + прямые routes на frontend_dist,
    # но пробуем чтобы /static/ тоже работал
    print(f'Карта конфликтов запускается: {URL}')
    print(f'Папка программы: {APP_DIR}')
    print('Не закрывайте это окно пока работаете с картой.')
    open_browser_delayed()
    try:
        from waitress import serve
        app = get_wsgi_application()
        serve(app, host=HOST, port=PORT, threads=8)
    except ImportError:
        # fallback на dev-server если нет waitress
        from django.core.management import execute_from_command_line
        execute_from_command_line([sys.argv[0], 'runserver', f'{HOST}:{PORT}', '--noreload'])


if __name__ == '__main__':
    main()
