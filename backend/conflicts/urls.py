from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ConflictViewSet, stats_view, geojson_view

router = DefaultRouter()
router.register(r'conflicts', ConflictViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('stats/', stats_view, name='stats'),
    path('geojson/', geojson_view, name='geojson'),
]
