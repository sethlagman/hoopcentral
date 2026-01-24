import json
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from core.models import Player, Team

class Command(BaseCommand):
    help = 'Seed NBA players into the database'

    def handle(self, *args, **kwargs):
        file_path = os.path.join(
            settings.BASE_DIR,
            '..',
            'data_ingestion',
            'output',
            'processed',
            'player.json')
        
        file_path = os.path.abspath(file_path)

        with open(file_path, encoding='utf-8') as f:
            players = json.load(f)

        for player in players:

            try:
                team = Team.objects.get(team_id=str(player["team_id"]))
                
            except Team.DoesNotExist:
                team = Team.objects.create(
                    team_id=str(player["team_id"]),
                    full_name=None,
                    abbreviation=None,
                    nickname=None,
                    city=None,
                    state=None,
                    year_founded=None,
                    logo=None
                )

            Player.objects.update_or_create(
                player_id=player['id'],
                defaults={
                    'full_name': player['full_name'],
                    'last_name': player['last_name'],
                    'first_name': player['first_name'],
                    'team': team,
                    'jersey': player['jersey'],
                    'is_active': player['is_active'] == 'true',
                    'headshot': player['headshot'],
                    'year_start': player['year_start'],
                    'year_end': player['year_end']
                }
            )

        self.stdout.write(self.style.SUCCESS('NBA players seeded successfully'))
