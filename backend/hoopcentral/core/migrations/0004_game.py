import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_statistic_team'),
    ]

    operations = [
        migrations.CreateModel(
            name='Game',
            fields=[
                ('game_id', models.CharField(max_length=20, primary_key=True, serialize=False, verbose_name='Game ID')),
                ('season', models.CharField(max_length=30, verbose_name='Season')),
                ('game_date', models.DateField(verbose_name='Game date')),
                ('tip_time_est', models.CharField(blank=True, max_length=40, verbose_name='Tip time (ET)')),
                ('status', models.IntegerField(blank=True, null=True, verbose_name='Game status code')),
                ('status_text', models.CharField(blank=True, max_length=40, verbose_name='Game status text')),
                ('arena_name', models.CharField(blank=True, max_length=120, verbose_name='Arena')),
                ('arena_city', models.CharField(blank=True, max_length=80, verbose_name='Arena city')),
                ('home_score', models.IntegerField(blank=True, null=True, verbose_name='Home score')),
                ('away_score', models.IntegerField(blank=True, null=True, verbose_name='Away score')),
                ('away_team', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='away_games', to='core.team')),
                ('home_team', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='home_games', to='core.team')),
            ],
            options={
                'ordering': ['game_date', 'tip_time_est', 'game_id'],
            },
        ),
    ]
