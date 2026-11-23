from decimal import Decimal

from django.test import TestCase

from core.serializers import GameSerializer, StatisticSerializer
from core.tests.test_views import _mk_player, _mk_stat, _mk_team
from core.models import Game


class SerializerTests(TestCase):
    databases = {"default"}

    def test_statistic_uses_stat_team_when_present(self):
        played_for = _mk_team("s-1")
        played_for.abbreviation = "BOS"
        played_for.full_name = "Boston Celtics"
        played_for.save()
        current = _mk_team("s-2")
        player = _mk_player(current, pid="s-p")
        stat = _mk_stat(player, team=played_for, ppg=Decimal("19.5"))
        data = StatisticSerializer(stat).data
        self.assertEqual(data["club_id"], "s-1")
        self.assertEqual(data["team_abbreviation"], "BOS")
        self.assertEqual(data["team_name"], "Boston Celtics")
        self.assertEqual(data["player_name"], player.full_name)

    def test_statistic_falls_back_to_player_team(self):
        team = _mk_team("s-3")
        player = _mk_player(team, pid="s-p3")
        stat = _mk_stat(player, team=None)
        data = StatisticSerializer(stat).data
        self.assertEqual(data["club_id"], "s-3")
        self.assertEqual(data["team_name"], "Test Team")

    def test_game_serializer_includes_score_and_venue(self):
        home = _mk_team("s-4")
        away = _mk_team("s-5")
        away.full_name = "Away Club"
        away.abbreviation = "AWY"
        away.save()
        game = Game.objects.create(
            game_id="0022500888",
            season="2025-26",
            game_date="2026-01-02",
            status_text="Final",
            arena_name="Garden",
            home_team=home,
            away_team=away,
            home_score=110,
            away_score=99,
        )
        data = GameSerializer(game).data
        self.assertEqual(data["home_team_name"], "Test Team")
        self.assertEqual(data["away_tricode"], "AWY")
        self.assertEqual(data["home_score"], 110)
        self.assertEqual(data["arena_name"], "Garden")
