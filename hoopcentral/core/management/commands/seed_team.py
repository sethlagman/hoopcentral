import json
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from core.models import Team

class Command(BaseCommand):
    help = 'Seed NBA teams into the database'

    def handle(self, *args, **kwargs):
        file_path = os.path.join(
            settings.BASE_DIR,
            '..',
            'data_ingestion',
            'output',
            'processed',
            'team.json')

        file_path = os.path.abspath(file_path)

        with open(file_path, encoding='utf-8') as f:
            teams = json.load(f)

        for team in teams:
            Team.objects.update_or_create(
                team_id=team['id'],
                defaults={
                    'full_name': team['full_name'],
                    'abbreviation': team['abbreviation'],
                    'nickname': team['nickname'],
                    'city': team['city'],
                    'state': team['state'],
                    'year_founded': team['year_founded'],
                    'logo': team['logo'],
                }
            )

        self.stdout.write(self.style.SUCCESS('NBA teams seeded successfully'))
