from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.views.static import serve as static_serve
from pathlib import Path


def frontend_index(request):
    return TemplateView.as_view(template_name='index.html')(request)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('conflicts.urls')),
]

# --- Frontend dist (для .exe и dev без Vite) ---
# /assets/* -> frontend_dist/assets/*, favicon/avatar -> корень dist
_frontend = Path(getattr(settings, 'FRONTEND_DIST', Path(settings.BASE_DIR) / 'frontend_dist'))
if _frontend.exists():
    urlpatterns += [
        re_path(r'^assets/(?P<path>.*)$', static_serve, {
            'document_root': str(_frontend / 'assets'),
        }),
        re_path(r'^favicon\.ico$', static_serve, {
            'document_root': str(_frontend),
            'path': 'favicon.ico',
        }),
        re_path(r'^favicon\.png$', static_serve, {
            'document_root': str(_frontend),
            'path': 'favicon.png',
        }),
        re_path(r'^avatar\.png$', static_serve, {
            'document_root': str(_frontend),
            'path': 'avatar.png',
        }),
    ]

# Главная и любые не-API пути -> index.html (SPA)
urlpatterns += [
    path('', frontend_index, name='frontend-index'),
    re_path(r'^(?!api/|admin/|static/|assets/|favicon\.ico|favicon\.png|avatar\.png).*$', frontend_index, name='frontend-spa'),
]
