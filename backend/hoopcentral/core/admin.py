from django.contrib import admin

from .models import IngestionRun


@admin.register(IngestionRun)
class IngestionRunAdmin(admin.ModelAdmin):
    list_display = (
        'source',
        'status',
        'started_at',
        'finished_at',
        'created_count',
        'updated_count',
        'unchanged_count',
        'skipped_count',
    )
    list_filter = ('source', 'status')
    readonly_fields = (
        'source',
        'status',
        'started_at',
        'finished_at',
        'created_count',
        'updated_count',
        'unchanged_count',
        'skipped_count',
        'error',
    )

    def has_add_permission(self, request):
        return False
