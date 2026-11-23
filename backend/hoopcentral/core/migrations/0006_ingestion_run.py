from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0005_remove_schedule_only_teams'),
    ]

    operations = [
        migrations.CreateModel(
            name='IngestionRun',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('source', models.CharField(max_length=40)),
                (
                    'status',
                    models.CharField(
                        choices=[('running', 'running'), ('success', 'success'), ('failed', 'failed')],
                        default='running',
                        max_length=20,
                    ),
                ),
                ('started_at', models.DateTimeField(auto_now_add=True)),
                ('finished_at', models.DateTimeField(blank=True, null=True)),
                ('created_count', models.PositiveIntegerField(default=0)),
                ('updated_count', models.PositiveIntegerField(default=0)),
                ('unchanged_count', models.PositiveIntegerField(default=0)),
                ('skipped_count', models.PositiveIntegerField(default=0)),
                ('error', models.TextField(blank=True)),
            ],
            options={
                'ordering': ['-started_at'],
                'indexes': [
                    models.Index(fields=['status', 'finished_at'], name='ingestion_status_finished_idx'),
                    models.Index(fields=['source', 'started_at'], name='ingestion_source_started_idx'),
                ],
            },
        ),
    ]
