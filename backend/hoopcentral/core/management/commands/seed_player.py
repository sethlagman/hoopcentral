import json

from django.core.management.base import BaseCommand, CommandError

from core.models import Player, Team
from core.seed_support import as_bool, as_text, processed_path, run_seed, upsert


class Command(BaseCommand):
    help = 'Seed NBA players into the database'

    def add_arguments(self, parser):
        parser.add_argument('--file', default=None)

    def handle(self, *args, **options):
        path = options['file'] or processed_path('nba_player.json')

        def loader(tally):
            chosen = {}
            order = []
            for player in _load_player_file(path):
                if not isinstance(player, dict) or player.get('id') in (None, ''):
                    tally.add('skipped')
                    continue
                player_id = str(player['id'])
                if player_id not in chosen:
                    order.append(player_id)
                chosen[player_id] = player
            for player_id in order:
                player = chosen[player_id]
                team_id = player.get('team_id')
                if team_id in (None, ''):
                    tally.add('skipped')
                    continue
                full_name = as_text(player.get('full_name'))
                first_name = as_text(player.get('first_name'))
                last_name = as_text(player.get('last_name'))
                if not full_name:
                    full_name = f'{first_name} {last_name}'.strip()
                if not full_name:
                    tally.add('skipped')
                    continue
                team = _team_for_player(str(team_id))
                outcome = upsert(
                    Player,
                    {'player_id': player_id},
                    {
                        'full_name': full_name,
                        'last_name': last_name,
                        'first_name': first_name,
                        'team': team,
                        'jersey': as_text(player.get('jersey')) or None,
                        'is_active': as_bool(player.get('is_active')),
                        'headshot': as_text(player.get('headshot')),
                        'year_start': as_text(player.get('year_start')),
                        'year_end': as_text(player.get('year_end')),
                    },
                )
                tally.add(outcome)

        run_seed('player', 'NBA players seeded successfully', self.stdout, self.style, loader)


def _load_player_file(path):
    try:
        with open(path, encoding='utf-8') as handle:
            players = json.load(handle)
    except FileNotFoundError as exc:
        raise CommandError(f'Player file not found: {path}') from exc
    except json.JSONDecodeError as exc:
        raise CommandError(f'Player file is not valid JSON: {path}') from exc
    if not isinstance(players, list):
        raise CommandError('Player file must be a JSON array')
    return players


def _team_for_player(team_id):
    try:
        return Team.objects.get(team_id=team_id)
    except Team.DoesNotExist:
        # Some players belong to defunct franchises that are not in the team list.
        # Player.team is required, so create a placeholder Team with empty fields.
        return Team.objects.create(
            team_id=team_id,
            full_name=None,
            abbreviation=None,
            nickname=None,
            city=None,
            state=None,
            year_founded=None,
            logo=None,
        )
