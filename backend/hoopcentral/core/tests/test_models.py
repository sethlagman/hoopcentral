from decimal import Decimal

from django.db import IntegrityError
from django.test import TestCase

from core.models import Game, Player, Statistic, Team
from core.tests.test_views import _mk_player, _mk_standing, _mk_stat, _mk_team


class ModelConstraintTests(TestCase):
    databases = {"default"}

    def test_statistic_player_season_is_unique(self):
        team = _mk_team("m-1")
        player = _mk_player(team, pid="m-p")
        _mk_stat(player, season="2024-25")
        with self.assertRaises(IntegrityError):
            _mk_stat(player, season="2024-25", ppg=Decimal("1.0"))

    def test_standing_team_season_is_unique(self):
        team = _mk_team("m-2")
        _mk_standing(team, season="2024-25")
        with self.assertRaises(IntegrityError):
            _mk_standing(team, season="2024-25")

    def test_team_delete_removes_players_and_games(self):
        home = _mk_team("m-3")
        away = _mk_team("m-4")
        player = _mk_player(home, pid="m-p3")
        _mk_stat(player)
        Game.objects.create(
            game_id="0022500999",
            season="2025-26",
            game_date="2025-11-01",
            home_team=home,
            away_team=away,
        )
        home.delete()
        self.assertFalse(Player.objects.filter(player_id="m-p3").exists())
        self.assertFalse(Statistic.objects.filter(player_id="m-p3").exists())
        self.assertFalse(Game.objects.filter(game_id="0022500999").exists())
        self.assertTrue(Team.objects.filter(team_id="m-4").exists())

    def test_timestamps_are_set(self):
        team = _mk_team("m-5")
        self.assertIsNotNone(team.created_at)
        self.assertIsNotNone(team.updated_at)
        standing = _mk_standing(team)
        self.assertIsNotNone(standing.created_at)
