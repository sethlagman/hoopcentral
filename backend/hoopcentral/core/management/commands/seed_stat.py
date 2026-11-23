import json

from django.core.management.base import BaseCommand, CommandError

from core.models import Player, Statistic, Team
from core.seed_support import canonical_season, coerce_decimal, processed_path, run_seed, upsert


class Command(BaseCommand):
    help = 'Seed NBA statistics into the database'

    def add_arguments(self, parser):
        parser.add_argument('--file', default=None)

    def handle(self, *args, **options):
        path = options['file'] or processed_path('nba_statistic.json')

        def loader(tally):
            statistics = _load_stat_file(path)
            # ``2024`` and ``2024-25`` are the same season. Keep the last row, then write once.
            chosen = {}
            order = []
            for year_data in statistics:
                if not isinstance(year_data, dict):
                    tally.add('skipped')
                    continue
                for year, data in year_data.items():
                    season = canonical_season(year)
                    if not season or not isinstance(data, list):
                        tally.add('skipped')
                        continue
                    for stat in data:
                        if not isinstance(stat, dict) or stat.get('id') in (None, ''):
                            tally.add('skipped')
                            continue
                        key = (str(stat['id']), season)
                        if key not in chosen:
                            order.append(key)
                        chosen[key] = stat
            for player_id, season in order:
                _seed_stat_row(tally, season, chosen[(player_id, season)])

        run_seed('statistic', 'NBA statistics seeded successfully', self.stdout, self.style, loader)


def _load_stat_file(path):
    try:
        with open(path, encoding='utf-8') as handle:
            statistics = json.load(handle)
    except FileNotFoundError as exc:
        raise CommandError(f'Statistic file not found: {path}') from exc
    except json.JSONDecodeError as exc:
        raise CommandError(f'Statistic file is not valid JSON: {path}') from exc
    if not isinstance(statistics, list):
        raise CommandError('Statistic file must be a JSON array')
    return statistics


def _seed_stat_row(tally, season, stat):
    try:
        player = Player.objects.get(player_id=str(stat['id']))
    except Player.DoesNotExist:
        tally.add('skipped')
        return
    try:
        ppg = coerce_decimal(stat.get('ppg'), 1)
        rpg = coerce_decimal(stat.get('rpg'), 1)
        apg = coerce_decimal(stat.get('apg'), 1)
    except ValueError:
        tally.add('skipped')
        return
    stat_team = _stat_team(stat.get('team_id'), player)
    outcome = upsert(
        Statistic,
        {'player': player, 'season': season},
        {
            'team': stat_team,
            'ppg': ppg,
            'rpg': rpg,
            'apg': apg,
        },
    )
    tally.add(outcome)


def _stat_team(team_id, player):
    if team_id is not None and str(team_id).strip():
        match = Team.objects.filter(team_id=str(team_id).strip()).first()
        if match is not None:
            return match
    return player.team
