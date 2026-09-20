from django.contrib import admin
from .models import Conflict


@admin.register(Conflict)
class ConflictAdmin(admin.ModelAdmin):
    list_display = ('title', 'severity', 'status', 'cause', 'country', 'start_date')
    list_filter = ('severity', 'status', 'cause', 'country')
    search_fields = ('title', 'country', 'region')
    readonly_fields = ('created_at', 'updated_at')