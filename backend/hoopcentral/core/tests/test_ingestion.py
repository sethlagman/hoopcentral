import importlib.util
import json
import tempfile
from decimal import Decimal
from pathlib import Path
from unittest.mock import Mock, patch

from django.conf import settings
from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import SimpleTestCase, TestCase

from core.models import IngestionRun, Player, Standing, Statistic, Team


def _load(relative, name):
    path = settings.BASE_DIR.parent / relative
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _player_row(player_id=7, team_id=10, ppg=18.2):
    row = [None] * 26
    row[0] = player_id
    row[1] = "Doe"
    row[2] = "Jane"
    row[4] = team_id
    row[10] = "7"
    row[19] = 1
    row[20] = ppg
    row[21] = 4.0
    row[22] = 3.0
    row[24] = 2020
    row[25] = 2026
    return row


def _standing_row(team_id=10, wins=42):
    row = [None] * 37
    row[2] = team_id
    row[6] = "East"
    row[7] = "10-2"
    row[11] = "6-1"
    row[13] = wins
    row[14] = 20
    row[15] = 0.677
    row[18] = "20-8"
    row[19] = "22-12"
    row[20] = "7-3"
    row[23] = "1"
    row[36] = 3
    return row


class HttpRetryTests(SimpleTestCase):
    def test_retries_retryable_status_then_returns(self):
        http = _load("data_ingestion/fetcher/http_utils.py", "ingestion_http_utils")
        failed = Mock(status_code=503, reason="unavailable")
        ok = Mock(status_code=200)
        ok.raise_for_status = Mock()
        with patch.object(http.requests, "get", side_effect=[failed, ok]) as get:
            with patch.object(http.time, "sleep") as sleep:
                response = http.get_with_retry("http://example.test/stats", max_retries=2, backoff_base=0)
        self.assertIs(response, ok)
        self.assertEqual(get.call_count, 2)
        sleep.assert_called()

    def test_timeout_is_retried(self):
        http = _load("data_ingestion/fetcher/http_utils.py", "ingestion_http_utils_timeout")
        ok = Mock(status_code=200)
        ok.raise_for_status = Mock()
        with patch.object(http.requests, "get", side_effect=[http.requests.exceptions.Timeout("slow"), ok]):
            with patch.object(http.time, "sleep"):
                response = http.get_with_retry("http://example.test/stats", max_retries=2, backoff_base=0)
        self.assertIs(response, ok)


class ProcessorTests(SimpleTestCase):
    def test_player_processor_canonicalizes_season_and_skips_short_rows(self):
        processor = _load("data_ingestion/processer/process_nba_player.py", "process_nba_player_mod")
        payload = {
            "2024": {
                "resultSets": [
                    {
                        "headers": [],
                        "rowSet": [_player_row(player_id=7, ppg=10), _player_row(player_id=7, ppg=12), ["too-short"]],
                    }
                ]
            }
        }
        with tempfile.TemporaryDirectory() as temp:
            raw = Path(temp) / "raw.json"
            output = Path(temp) / "out"
            raw.write_text(json.dumps(payload), encoding="utf-8")
            result = processor.process_nba_player(raw, output_dir=output)
            stats = json.loads((output / "nba_statistic.json").read_text(encoding="utf-8"))
            players = json.loads((output / "nba_player.json").read_text(encoding="utf-8"))
        self.assertEqual(result["seasons"], 1)
        self.assertEqual(result["skipped"], 2)
        self.assertEqual(list(stats[0]), ["2024-25"])
        self.assertEqual(stats[0]["2024-25"][0]["ppg"], 12)
        self.assertEqual(players[0]["is_active"], "true")
        self.assertEqual(len(stats[0]["2024-25"]), 1)

    def test_player_processor_rejects_a_list(self):
        processor = _load("data_ingestion/processer/process_nba_player.py", "process_nba_player_bad")
        with tempfile.TemporaryDirectory() as temp:
            raw = Path(temp) / "raw.json"
            raw.write_text("[]", encoding="utf-8")
            with self.assertRaises(processor.InvalidPayload):
                processor.process_nba_player(raw, output_dir=Path(temp) / "out")

    def test_standing_processor_uses_headers_and_canonical_season(self):
        processor = _load("data_ingestion/processer/process_nba_standing.py", "process_nba_standing_mod")
        headers = [""] * 16
        headers[0] = "TeamID"
        headers[1] = "Conference"
        headers[13] = "WINS"
        headers[14] = "LOSSES"
        headers[15] = "WinPCT"
        row = [None] * 16
        row[0] = 99
        row[1] = "West"
        row[13] = 11
        row[14] = 4
        row[15] = 0.733
        payload = {"2020-21": {"resultSets": [{"headers": headers, "rowSet": [row, [None]]}]}}
        with tempfile.TemporaryDirectory() as temp:
            raw = Path(temp) / "raw.json"
            output = Path(temp) / "out"
            raw.write_text(json.dumps(payload), encoding="utf-8")
            processor.process_nba_standing(raw, output_dir=output)
            standings = json.loads((output / "nba_standing.json").read_text(encoding="utf-8"))
        self.assertEqual(list(standings[0]), ["2020-21"])
        self.assertEqual(standings[0]["2020-21"][0]["id"], "99")
        self.assertEqual(standings[0]["2020-21"][0]["conference"], "West")
        self.assertEqual(standings[0]["2020-21"][0]["wins"], 11)

    def test_team_processor_drops_rows_without_an_id(self):
        processor = _load("data_ingestion/processer/process_nba_team.py", "process_nba_team_mod")
        payload = [{"id": 1610612738, "full_name": "Boston Celtics"}, {"full_name": "Missing"}]
        with tempfile.TemporaryDirectory() as temp:
            raw = Path(temp) / "raw.json"
            output = Path(temp) / "out"
            raw.write_text(json.dumps(payload), encoding="utf-8")
            result = processor.process_nba_team(raw, output_dir=output)
            teams = json.loads((output / "nba_team.json").read_text(encoding="utf-8"))
        self.assertEqual(result["written"], 1)
        self.assertEqual(result["skipped"], 1)
        self.assertEqual(teams[0]["id"], "1610612738")
        self.assertIn("1610612738", teams[0]["logo"])


class SeedIdempotencyTests(TestCase):
    databases = {"default"}

    def _write(self, payload):
        handle = tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8")
        json.dump(payload, handle)
        handle.close()
        self.addCleanup(lambda: Path(handle.name).unlink(missing_ok=True))
        return handle.name

    def test_team_seed_is_idempotent_and_records_a_run(self):
        path = self._write(
            [
                {
                    "id": "1610612738",
                    "full_name": "Boston Celtics",
                    "abbreviation": "BOS",
                    "nickname": "Celtics",
                    "city": "Boston",
                    "state": "Massachusetts",
                    "year_founded": 1946,
                    "logo": "https://example.com/bos.svg",
                }
            ]
        )
        call_command("seed_team", file=path)
        call_command("seed_team", file=path)
        self.assertEqual(Team.objects.filter(team_id="1610612738").count(), 1)
        second = IngestionRun.objects.filter(source="team", status="success").order_by("-started_at").first()
        self.assertEqual(second.unchanged_count, 1)
        self.assertEqual(second.created_count, 0)

    def test_stat_seed_collapses_season_aliases_and_skips_unknown_players(self):
        team = Team.objects.create(team_id="10", full_name="Club", abbreviation="CLB")
        Player.objects.create(
            player_id="7",
            full_name="Jane Doe",
            first_name="Jane",
            last_name="Doe",
            team=team,
            is_active=True,
            headshot="https://example.com/j.png",
            year_start="2020",
            year_end="2026",
        )
        path = self._write(
            [
                {"2024": [{"id": "7", "team_id": "10", "ppg": 10, "rpg": 4, "apg": 3}]},
                {"2024-25": [{"id": "7", "team_id": "10", "ppg": 12.2, "rpg": 5, "apg": 4}]},
                {"2024-25": [{"id": "missing", "team_id": "10", "ppg": 1, "rpg": 1, "apg": 1}]},
            ]
        )
        call_command("seed_stat", file=path)
        stats = Statistic.objects.filter(player_id="7")
        self.assertEqual(stats.count(), 1)
        self.assertEqual(stats.get().season, "2024-25")
        self.assertEqual(stats.get().ppg, Decimal("12.2"))
        run = IngestionRun.objects.filter(source="statistic", status="success").get()
        self.assertEqual(run.skipped_count, 1)
        self.assertEqual(run.created_count, 1)
        call_command("seed_stat", file=path)
        self.assertEqual(Statistic.objects.filter(player_id="7").count(), 1)
        second = IngestionRun.objects.filter(source="statistic", status="success").order_by("-started_at").first()
        self.assertEqual(second.unchanged_count, 1)
        self.assertEqual(second.updated_count, 0)

    def test_standing_seed_skips_unknown_team(self):
        Team.objects.create(team_id="10", full_name="Club")
        path = self._write(
            [
                {
                    "2025": [
                        {
                            "id": "10",
                            "conference": "East",
                            "conference_record": "1-0",
                            "division_record": "1-0",
                            "wins": 1,
                            "losses": 0,
                            "winrate": 1,
                            "home": "1-0",
                            "road": "0-0",
                            "last10": "1-0",
                            "overtime": "0",
                            "winstreak": "W1",
                        },
                        {
                            "id": "404",
                            "conference": "West",
                            "wins": 2,
                            "losses": 1,
                            "winrate": 0.667,
                        },
                    ]
                }
            ]
        )
        call_command("seed_standing", file=path)
        standing = Standing.objects.get()
        self.assertEqual(standing.season, "2025-26")
        self.assertEqual(standing.team_id, "10")
        run = IngestionRun.objects.filter(source="standing", status="success").get()
        self.assertEqual(run.skipped_count, 1)

    def test_schedule_seed_canonicalizes_season(self):
        home = Team.objects.create(team_id="1", full_name="Home")
        Team.objects.create(team_id="2", full_name="Away")
        path = self._write(
            [
                {
                    "game_id": "0022500001",
                    "season": "2025",
                    "game_date": "2025-10-22",
                    "home_team_id": home.team_id,
                    "away_team_id": "2",
                    "status": 1,
                    "home_score": None,
                    "away_score": None,
                },
                {"game_id": "bad", "season": "2025", "home_team_id": "missing", "away_team_id": "2"},
            ]
        )
        call_command("seed_schedule", file=path)
        from core.models import Game

        game = Game.objects.get(game_id="0022500001")
        self.assertEqual(game.season, "2025-26")
        run = IngestionRun.objects.filter(source="schedule", status="success").get()
        self.assertEqual(run.created_count, 1)
        self.assertEqual(run.skipped_count, 1)

    def test_missing_file_is_a_failed_run(self):
        with self.assertRaises(CommandError):
            call_command("seed_team", file="/tmp/hoopcentral-missing-teams.json")
        run = IngestionRun.objects.filter(source="team", status="failed").get()
        self.assertIn("not found", run.error)

    def test_ingestion_status_lists_latest_run(self):
        Team.objects.create(team_id="1", full_name="Only")
        path = self._write(
            [{"id": "1", "full_name": "Only", "abbreviation": "ONL", "nickname": "Only", "city": "C", "state": "S", "year_founded": 2000, "logo": "https://example.com/o.svg"}]
        )
        call_command("seed_team", file=path)
        call_command("ingestion_status")
