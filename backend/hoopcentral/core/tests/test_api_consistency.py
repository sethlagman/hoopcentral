from decimal import Decimal

from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from core.tests.test_views import _mk_player, _mk_standing, _mk_stat, _mk_team


class StandingAndTeamQueryTests(TestCase):
    databases = {"default"}

    def setUp(self):
        self.client = APIClient()
        self.east = _mk_team("a-east")
        self.east.full_name = "Boston Celtics"
        self.east.abbreviation = "BOS"
        self.east.nickname = "Celtics"
        self.east.city = "Boston"
        self.east.save()
        self.west = _mk_team("a-west")
        self.west.full_name = "Los Angeles Lakers"
        self.west.abbreviation = "LAL"
        self.west.save()
        east_row = _mk_standing(self.east, season="2024-25")
        east_row.conference = "East"
        east_row.wins = 50
        east_row.save()
        west_row = _mk_standing(self.west, season="2025-26")
        west_row.conference = "West"
        west_row.wins = 40
        west_row.save()
        current = _mk_standing(self.east, season="2025")
        current.conference = "East"
        current.wins = 55
        current.save()

    def test_standing_filters_season_conference_and_ordering(self):
        response = self.client.get("/api/standing?season=2025&conference=east&ordering=-wins")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        rows = response.json()["results"]
        self.assertEqual([row["team"] for row in rows], ["a-east"])
        self.assertEqual(rows[0]["season"], "2025")

    def test_standing_bad_conference_and_ordering(self):
        conference = self.client.get("/api/standing?conference=central")
        self.assertEqual(conference.status_code, status.HTTP_400_BAD_REQUEST)
        ordering = self.client.get("/api/standing?ordering=points")
        self.assertEqual(ordering.status_code, status.HTTP_400_BAD_REQUEST)

    def test_team_search_keeps_a_list(self):
        response = self.client.get("/api/team?search=bos")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        body = response.json()
        self.assertIsInstance(body, list)
        self.assertEqual([row["team_id"] for row in body], ["a-east"])

    def test_player_statistics_select_season_rows(self):
        player = _mk_player(self.east, pid="a-p")
        _mk_stat(player, season="2024-25", ppg=Decimal("11.0"))
        _mk_stat(player, season="2025-26", ppg=Decimal("22.0"))
        response = self.client.get("/api/statistic/a-p/2025")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        seasons = {row["season"] for row in response.json()}
        self.assertIn("2025-26", seasons)
        self.assertNotIn("2024-25", seasons)
