import json
import os

from django.core.management.base import BaseCommand
from django.conf import settings

from core.models import Game, Team


def _team(team_id, full_name, abbreviation):
    team, _created = Team.objects.get_or_create(
        team_id=str(team_id),
        defaults={
            'full_name': full_name or abbreviation or str(team_id),
            'abbreviation': abbreviation or '',
            'nickname': None,
            'city': None,
            'state': None,
            'year_founded': None,
            'logo': None,
        },
    )
    return team


class Command(BaseCommand):
    help = 'Seed NBA schedule games into the database'

    def handle(self, *args, **kwargs):
        file_path = os.path.abspath(
            os.path.join(
                settings.BASE_DIR,
                '..',
                'data_ingestion',
                'output',
                'processed',
                'nba_schedule.json',
            )
        )

        with open(file_path, encoding='utf-8') as f:
            games = json.load(f)

        for game in games:
            home = _team(game['home_team_id'], game.get('home_team_name'), game.get('home_tricode'))
            away = _team(game['away_team_id'], game.get('away_team_name'), game.get('away_tricode'))
            Game.objects.update_or_create(
                game_id=str(game['game_id']),
                defaults={
                    'season': game['season'],
                    'game_date': game['game_date'],
                    'tip_time_est': game.get('tip_time_est') or '',
                    'status': game.get('status'),
                    'status_text': game.get('status_text') or '',
                    'arena_name': game.get('arena_name') or '',
                    'arena_city': game.get('arena_city') or '',
                    'home_team': home,
                    'away_team': away,
                    'home_score': game.get('home_score'),
                    'away_score': game.get('away_score'),
                },
            )

        self.stdout.write(self.style.SUCCESS(f'NBA schedule seeded successfully'))
