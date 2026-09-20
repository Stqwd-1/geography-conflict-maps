# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['run_desktop.py'],
    pathex=[],
    binaries=[],
    datas=[('frontend_dist', 'frontend_dist'), ('conflict_map', 'conflict_map'), ('conflicts', 'conflicts'), ('manage.py', '.'), ('db.sqlite3', '.')],
    hiddenimports=['waitress', 'whitenoise.middleware', 'corsheaders.middleware', 'rest_framework', 'conflicts.apps'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='ConflictMap',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=['app_icon.ico'],
)
