import importlib.util
from datetime import date

from django.conf import settings
from django.test import SimpleTestCase, TestCase
from rest_framework import status
from rest_framework.test import APIClient

from core.models import Game, Team


def _load_schedule_processor():
    path = settings.BASE_DIR.parent / "data_ingestion" / "processer" / "process_nba_schedule.py"
    spec = importlib.util.spec_from_file_location("process_nba_schedule", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _schedule_game(game_id, away, home, status_text="Final"):
    return {
        "gameId": game_id,
        "gameDateEst": "2025-10-04T00:00:00Z",
        "gameTimeEst": "1900-01-01T19:30:00Z",
        "gameStatus": 3,
        "gameStatusText": status_text,
        "arenaName": "Arena",
        "arenaCity": "City",
        "awayTeam": {"teamId": away[0], "teamCity": away[1], "teamName": away[2], "teamTricode": away[3], "score": 100},
        "homeTeam": {"teamId": home[0], "teamCity": home[1], "teamName": home[2], "teamTricode": home[3], "score": 101},
    }


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
        Game.objects.create(
            game_id="0022500100",
            season="2025-26",
            game_date=date(2026, 4, 12),
            tip_time_est="3:30 pm ET",
            status=3,
            status_text="Final",
            arena_name="Madison Square Garden",
            arena_city="New York",
            home_team=away,
            away_team=home,
            home_score=101,
            away_score=99,
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

    def test_latest_game_is_first(self):
        response = self.client.get("/api/schedule?season=2025-26")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        body = response.json()
        self.assertEqual(body["count"], 2)
        self.assertEqual(body["page"], 1)
        self.assertEqual(body["games"][0]["game_id"], "0022500100")
        self.assertEqual(body["games"][1]["game_id"], "0022500001")

    def test_page_size_walks_older_games(self):
        first = self.client.get("/api/schedule?season=2025-26&page_size=1&page=1")
        second = self.client.get("/api/schedule?season=2025-26&page_size=1&page=2")
        self.assertEqual(first.json()["games"][0]["game_id"], "0022500100")
        self.assertEqual(first.json()["count"], 2)
        self.assertEqual(second.json()["games"][0]["game_id"], "0022500001")
        self.assertEqual(second.json()["page"], 2)

    def test_from_to_ascending(self):
        response = self.client.get(
            "/api/schedule?season=2025-26&from=2025-10-01&to=2025-10-31&order=asc"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        body = response.json()
        self.assertEqual(body["count"], 1)
        self.assertEqual(body["games"][0]["game_id"], "0022500001")

    def test_bad_order(self):
        response = self.client.get("/api/schedule?order=sideways")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_bad_from_date(self):
        response = self.client.get("/api/schedule?from=10-22-2025")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class GamesFromScheduleTests(SimpleTestCase):
    def setUp(self):
        self.processor = _load_schedule_processor()

    def test_keeps_only_nba_vs_nba_games(self):
        celtics = (1610612738, "Boston", "Celtics", "BOS")
        knicks = (1610612752, "New York", "Knicks", "NYK")
        melbourne = (15016, "Melbourne", "United", "MEL")
        stars = (1610616859, "", "Stars", "STR")
        stripes = (1610616860, "", "Stripes", "STP")
        payload = {
            "leagueSchedule": {
                "seasonYear": "2025-26",
                "gameDates": [
                    {
                        "gameDate": "10/04/2025 00:00:00",
                        "games": [
                            _schedule_game("0022500001", knicks, celtics, "Final      "),
                            _schedule_game("0012500009", melbourne, celtics),
                            _schedule_game("0032500021", stars, stripes),
                        ],
                    }
                ],
            }
        }

        games = self.processor.games_from_schedule(payload, season="2025-26")

        self.assertEqual([g["game_id"] for g in games], ["0022500001"])
        self.assertEqual(games[0]["status_text"], "Final")
