from django.core.management.base import BaseCommand

from core.models import IngestionRun


class Command(BaseCommand):
    help = 'Print the latest ingestion run for each source'

    def handle(self, *args, **options):
        sources = sorted(set(IngestionRun.objects.values_list('source', flat=True)))
        if not sources:
            self.stdout.write('No ingestion runs recorded')
            return
        for source in sources:
            run = IngestionRun.objects.filter(source=source).order_by('-started_at').first()
            finished = run.finished_at.isoformat() if run.finished_at else '-'
            self.stdout.write(
                f'{run.source} status={run.status} finished={finished} '
                f'created={run.created_count} updated={run.updated_count} '
                f'unchanged={run.unchanged_count} skipped={run.skipped_count}'
            )
