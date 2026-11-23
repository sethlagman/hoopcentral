import json

from django.core.management.base import BaseCommand, CommandError

from core.models import Standing, Team
from core.seed_support import as_text, canonical_season, coerce_decimal, coerce_int, processed_path, run_seed, upsert


class Command(BaseCommand):
    help = 'Seed NBA standings into the database'

    def add_arguments(self, parser):
        parser.add_argument('--file', default=None)

    def handle(self, *args, **options):
        path = options['file'] or processed_path('nba_standing.json')

        def loader(tally):
            standings = _load_standing_file(path)
            chosen = {}
            order = []
            for year_data in standings:
                if not isinstance(year_data, dict):
                    tally.add('skipped')
                    continue
                for year, data in year_data.items():
                    season = canonical_season(year)
                    if not season or not isinstance(data, list):
                        tally.add('skipped')
                        continue
                    for standing in data:
                        if not isinstance(standing, dict) or standing.get('id') in (None, ''):
                            tally.add('skipped')
                            continue
                        key = (str(standing['id']), season)
                        if key not in chosen:
                            order.append(key)
                        chosen[key] = standing
            for team_id, season in order:
                _seed_standing_row(tally, season, chosen[(team_id, season)])

        run_seed('standing', 'NBA standings seeded successfully', self.stdout, self.style, loader)


def _load_standing_file(path):
    try:
        with open(path, encoding='utf-8') as handle:
            standings = json.load(handle)
    except FileNotFoundError as exc:
        raise CommandError(f'Standing file not found: {path}') from exc
    except json.JSONDecodeError as exc:
        raise CommandError(f'Standing file is not valid JSON: {path}') from exc
    if not isinstance(standings, list):
        raise CommandError('Standing file must be a JSON array')
    return standings


def _seed_standing_row(tally, season, standing):
    team = Team.objects.filter(team_id=str(standing['id'])).first()
    if team is None:
        tally.add('skipped')
        return
    try:
        wins = coerce_int(standing.get('wins'))
        losses = coerce_int(standing.get('losses'))
        winrate = coerce_decimal(standing.get('winrate'), 3)
    except (TypeError, ValueError):
        tally.add('skipped')
        return
    if wins is None or losses is None or winrate is None:
        tally.add('skipped')
        return
    outcome = upsert(
        Standing,
        {'team': team, 'season': season},
        {
            'conference': as_text(standing.get('conference')),
            'conference_record': as_text(standing.get('conference_record')),
            'division_record': as_text(standing.get('division_record')),
            'wins': wins,
            'losses': losses,
            'winrate': winrate,
            'home': as_text(standing.get('home')),
            'road': as_text(standing.get('road')),
            'last10': as_text(standing.get('last10')) or None,
            'overtime': as_text(standing.get('overtime')),
            'winstreak': as_text(standing.get('winstreak')) or None,
        },
    )
    tally.add(outcome)
