from datetime import date

from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from core.models import Game, Team


def _team(team_id, name, abbreviation):
    return Team.objects.create(
        team_id=team_id,
        full_name=name,
        abbreviation=abbreviation,
        nickname=name,
        city=name,
        state="MA",
        year_founded=1946,
        logo="http://example.com/logo.png",
    )


class ScheduleViewTests(TestCase):
    databases = {"default"}

    def setUp(self):
        self.client = APIClient()
        home = _team("1610612738", "Boston Celtics", "BOS")
        away = _team("1610612752", "New York Knicks", "NYK")
        Game.objects.create(
            game_id="0022500001",
            season="2025-26",
            game_date=date(2025, 10, 22),
            tip_time_est="7:30 pm ET",
            status=1,
            status_text="7:30 pm ET",
            arena_name="TD Garden",
            arena_city="Boston",
            home_team=home,
            away_team=away,
            home_score=0,
            away_score=0,
        )

    def test_filter_by_date(self):
        response = self.client.get("/api/schedule?season=2025-26&date=2025-10-22")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        body = response.json()
        self.assertEqual(body["count"], 1)
        self.assertEqual(body["games"][0]["home_tricode"], "BOS")
        self.assertEqual(body["games"][0]["away_team_name"], "New York Knicks")

    def test_filter_by_abbreviation(self):
        response = self.client.get("/api/schedule?season=2025-26&team=nyk&date=2025-10-22")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["count"], 1)

    def test_unknown_team_is_empty(self):
        response = self.client.get("/api/schedule?season=2025-26&team=ZZZ&date=2025-10-22")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["games"], [])

    def test_bad_date(self):
        response = self.client.get("/api/schedule?date=10-22-2025")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
