from django.db import migrations
from nba_api.stats.static import teams


def remove_schedule_only_teams(apps, schema_editor):
    # seed_player creates placeholder teams for defunct franchises, so only
    # remove non-NBA teams that nothing but games point at.
    Team = apps.get_model('core', 'Team')
    nba_ids = [str(team['id']) for team in teams.get_teams()]
    Team.objects.exclude(team_id__in=nba_ids).filter(
        players__isnull=True,
        season_statistics__isnull=True,
        standings__isnull=True,
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0004_game'),
    ]

    operations = [
        migrations.RunPython(remove_schedule_only_teams, migrations.RunPython.noop),
    ]
