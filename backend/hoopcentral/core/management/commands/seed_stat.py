import json
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from core.models import Statistic, Player, Team

class Command(BaseCommand):
    help = 'Seed NBA statistics into the database'

    def handle(self, *args, **kwargs):
        file_path = os.path.join(
            settings.BASE_DIR,
            '..',
            'data_ingestion',
            'output',
            'processed',
            'nba_statistic.json')

        file_path = os.path.abspath(file_path)

        with open(file_path, encoding='utf-8') as f:
            statistics = json.load(f)
        
        for year_data in statistics:
            for year, data in year_data.items():
                for stat in data:

                    player = Player.objects.get(player_id=str(stat["id"]))
                    stat_team = None
                    tid_raw = stat.get("team_id")
                    if tid_raw is not None and str(tid_raw).strip():
                        stat_team = Team.objects.filter(team_id=str(tid_raw).strip()).first()
                    if stat_team is None:
                        stat_team = player.team

                    Statistic.objects.update_or_create(
                        player=player,
                        season=year,
                        defaults={
                            'team': stat_team,
                            'ppg': stat['ppg'],
                            'rpg': stat['rpg'],
                            'apg': stat['apg'],
                        }
                    )

        self.stdout.write(self.style.SUCCESS('NBA statistics seeded successfully'))
