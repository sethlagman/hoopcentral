import django.utils.timezone
from django.db import migrations, models


def _canonical_season(value):
    """Keep in step with core.season_utils.canonical_season. Migrations stay frozen."""

    if value is None:
        return ''
    text = str(value).strip()
    if not text:
        return ''
    head = text.split('-', 1)[0].strip() if '-' in text else text
    if len(head) == 4 and head.isdigit() and (text == head or '-' in text):
        year = int(head)
        return f'{year}-{str(year + 1)[-2:]}'
    return text


def _rewrite_seasons(model):
    for pk, season in model.objects.values_list('pk', 'season'):
        updated = _canonical_season(season)
        if updated and updated != season:
            model.objects.filter(pk=pk).update(season=updated)


def _dedupe(model, field_names):
    seen = {}
    rows = model.objects.values_list('pk', *field_names).order_by('pk')
    for row in rows:
        pk = row[0]
        key = tuple(row[1:])
        previous = seen.get(key)
        if previous is None:
            seen[key] = pk
            continue
        model.objects.filter(pk=previous).delete()
        seen[key] = pk


def canonicalize_seasons(apps, schema_editor):
    statistic = apps.get_model('core', 'Statistic')
    standing = apps.get_model('core', 'Standing')
    game = apps.get_model('core', 'Game')
    _rewrite_seasons(statistic)
    _rewrite_seasons(standing)
    _rewrite_seasons(game)
    _dedupe(statistic, ('player_id', 'season'))
    _dedupe(standing, ('team_id', 'season'))


def _timestamp(model_name, name, auto_now_add):
    field = models.DateTimeField(auto_now_add=True) if auto_now_add else models.DateTimeField(auto_now=True)
    field.default = django.utils.timezone.now
    return migrations.AddField(
        model_name=model_name,
        name=name,
        field=field,
        preserve_default=False,
    )


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0005_remove_schedule_only_teams'),
    ]

    operations = [
        _timestamp('team', 'created_at', True),
        _timestamp('team', 'updated_at', False),
        _timestamp('player', 'created_at', True),
        _timestamp('player', 'updated_at', False),
        _timestamp('statistic', 'created_at', True),
        _timestamp('statistic', 'updated_at', False),
        _timestamp('standing', 'created_at', True),
        _timestamp('standing', 'updated_at', False),
        _timestamp('game', 'created_at', True),
        _timestamp('game', 'updated_at', False),
        migrations.RunPython(canonicalize_seasons, migrations.RunPython.noop),
        migrations.AddIndex(
            model_name='team',
            index=models.Index(fields=['abbreviation'], name='team_abbreviation_idx'),
        ),
        migrations.AddIndex(
            model_name='player',
            index=models.Index(fields=['is_active'], name='player_is_active_idx'),
        ),
        migrations.AddIndex(
            model_name='player',
            index=models.Index(fields=['full_name'], name='player_full_name_idx'),
        ),
        migrations.AddIndex(
            model_name='statistic',
            index=models.Index(fields=['season'], name='statistic_season_idx'),
        ),
        migrations.AddIndex(
            model_name='statistic',
            index=models.Index(fields=['season', 'ppg'], name='statistic_season_ppg_idx'),
        ),
        migrations.AddConstraint(
            model_name='statistic',
            constraint=models.UniqueConstraint(fields=('player', 'season'), name='uniq_statistic_player_season'),
        ),
        migrations.AddIndex(
            model_name='standing',
            index=models.Index(fields=['season'], name='standing_season_idx'),
        ),
        migrations.AddIndex(
            model_name='standing',
            index=models.Index(fields=['conference'], name='standing_conference_idx'),
        ),
        migrations.AddConstraint(
            model_name='standing',
            constraint=models.UniqueConstraint(fields=('team', 'season'), name='uniq_standing_team_season'),
        ),
        migrations.AddIndex(
            model_name='game',
            index=models.Index(fields=['season', 'game_date'], name='game_season_date_idx'),
        ),
    ]
