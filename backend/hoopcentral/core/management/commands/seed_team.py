import json

from django.core.management.base import BaseCommand, CommandError

from core.models import Team
from core.seed_support import as_text, coerce_int, processed_path, run_seed, upsert


class Command(BaseCommand):
    help = 'Seed NBA teams into the database'

    def add_arguments(self, parser):
        parser.add_argument('--file', default=None)

    def handle(self, *args, **options):
        path = options['file'] or processed_path('nba_team.json')

        def loader(tally):
            chosen = {}
            order = []
            for team in _load_team_file(path):
                if not isinstance(team, dict) or team.get('id') in (None, ''):
                    tally.add('skipped')
                    continue
                team_id = str(team['id'])
                if team_id not in chosen:
                    order.append(team_id)
                chosen[team_id] = team
            for team_id in order:
                team = chosen[team_id]
                try:
                    year_founded = coerce_int(team.get('year_founded'))
                except (TypeError, ValueError):
                    tally.add('skipped')
                    continue
                outcome = upsert(
                    Team,
                    {'team_id': team_id},
                    {
                        'full_name': as_text(team.get('full_name')) or None,
                        'abbreviation': as_text(team.get('abbreviation')) or None,
                        'nickname': as_text(team.get('nickname')) or None,
                        'city': as_text(team.get('city')) or None,
                        'state': as_text(team.get('state')) or None,
                        'year_founded': year_founded,
                        'logo': as_text(team.get('logo')) or None,
                    },
                )
                tally.add(outcome)

        run_seed('team', 'NBA teams seeded successfully', self.stdout, self.style, loader)


def _load_team_file(path):
    try:
        with open(path, encoding='utf-8') as handle:
            teams = json.load(handle)
    except FileNotFoundError as exc:
        raise CommandError(f'Team file not found: {path}') from exc
    except json.JSONDecodeError as exc:
        raise CommandError(f'Team file is not valid JSON: {path}') from exc
    if not isinstance(teams, list):
        raise CommandError('Team file must be a JSON array')
    return teams
