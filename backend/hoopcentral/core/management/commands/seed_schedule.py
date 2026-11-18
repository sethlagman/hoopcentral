import json
import os

from django.core.management.base import BaseCommand
from django.conf import settings

from core.models import Game, Team


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

        # Run seed_team first; games whose teams are not seeded are skipped, never created.
        teams = Team.objects.in_bulk()
        skipped = 0
        for game in games:
            home = teams.get(str(game['home_team_id']))
            away = teams.get(str(game['away_team_id']))
            if home is None or away is None:
                skipped += 1
                continue
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

        if skipped:
            self.stdout.write(self.style.WARNING(f'Skipped {skipped} games with unknown teams'))
        self.stdout.write(self.style.SUCCESS('NBA schedule seeded successfully'))
