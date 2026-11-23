import json
from datetime import datetime

from django.core.management.base import BaseCommand, CommandError

from core.models import Game, Team
from core.seed_support import as_text, canonical_season, coerce_int, processed_path, run_seed, upsert


class Command(BaseCommand):
    help = 'Seed NBA schedule games into the database'

    def add_arguments(self, parser):
        parser.add_argument('--file', default=None)

    def handle(self, *args, **options):
        path = options['file'] or processed_path('nba_schedule.json')

        def loader(tally):
            # Run seed_team first; games whose teams are not seeded are skipped, never created.
            teams = Team.objects.in_bulk()
            chosen = {}
            order = []
            for game in _load_schedule_file(path):
                if not isinstance(game, dict) or game.get('game_id') in (None, ''):
                    tally.add('skipped')
                    continue
                game_id = str(game['game_id'])
                if game_id not in chosen:
                    order.append(game_id)
                chosen[game_id] = game
            for game_id in order:
                _seed_game(tally, teams, chosen[game_id])

        run_seed('schedule', 'NBA schedule seeded successfully', self.stdout, self.style, loader)


def _load_schedule_file(path):
    try:
        with open(path, encoding='utf-8') as handle:
            games = json.load(handle)
    except FileNotFoundError as exc:
        raise CommandError(f'Schedule file not found: {path}') from exc
    except json.JSONDecodeError as exc:
        raise CommandError(f'Schedule file is not valid JSON: {path}') from exc
    if not isinstance(games, list):
        raise CommandError('Schedule file must be a JSON array')
    return games


def _seed_game(tally, teams, game):
    season = canonical_season(game.get('season'))
    if not season:
        tally.add('skipped')
        return
    try:
        game_date = datetime.strptime(str(game.get('game_date'))[:10], '%Y-%m-%d').date()
    except (TypeError, ValueError):
        tally.add('skipped')
        return
    home = teams.get(str(game.get('home_team_id')))
    away = teams.get(str(game.get('away_team_id')))
    if home is None or away is None:
        tally.add('skipped')
        return
    try:
        status = coerce_int(game.get('status'))
        home_score = coerce_int(game.get('home_score'))
        away_score = coerce_int(game.get('away_score'))
    except (TypeError, ValueError):
        tally.add('skipped')
        return
    outcome = upsert(
        Game,
        {'game_id': str(game['game_id'])},
        {
            'season': season,
            'game_date': game_date,
            'tip_time_est': as_text(game.get('tip_time_est')),
            'status': status,
            'status_text': as_text(game.get('status_text')),
            'arena_name': as_text(game.get('arena_name')),
            'arena_city': as_text(game.get('arena_city')),
            'home_team': home,
            'away_team': away,
            'home_score': home_score,
            'away_score': away_score,
        },
    )
    tally.add(outcome)
