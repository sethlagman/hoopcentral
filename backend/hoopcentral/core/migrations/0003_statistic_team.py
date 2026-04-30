# Generated manually for season-level franchise on Statistic

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_rename_standings_standing_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='statistic',
            name='team',
            field=models.ForeignKey(
                blank=True,
                help_text='Franchise this stat line was accumulated for (NBA season team).',
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='season_statistics',
                to='core.team',
            ),
        ),
    ]
