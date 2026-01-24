import json
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from core.models import Standings, Team

class Command(BaseCommand):
    help = 'Seed NBA standings into the database'

    def handle(self, *args, **kwargs):
        file_path = os.path.join(
            settings.BASE_DIR,
            '..',
            'data_ingestion',
            'output',
            'processed',
            'standing.json')
        
        file_path = os.path.abspath(file_path)

        with open(file_path, encoding='utf-8') as f:
            standings = json.load(f)

        for year_data in standings:
            for year, data in year_data.items():
                for standing in data:

                    team = Team.objects.get(team_id=str(standing["id"]))

                    Standings.objects.update_or_create(
                        team=team,
                        season=year,
                        defaults={
                            'conference': standing['conference'],
                            'conference_record': standing['conference_record'],
                            'division_record': standing['division_record'],
                            'wins': standing['wins'],
                            'losses': standing['losses'],
                            'winrate': standing['winrate'],
                            'home': standing['home'],
                            'road': standing['road'],
                            'last10': standing['last10'],
                            'overtime': standing['overtime'],
                            'winstreak': standing['winstreak'],
                            }
                    )

        self.stdout.write(self.style.SUCCESS('NBA standings seeded successfully'))
