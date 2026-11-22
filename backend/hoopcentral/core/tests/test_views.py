"""HTTP tests for core REST views."""

from decimal import Decimal
from unittest.mock import patch

from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from core.models import Player, Standing, Statistic, Team


def _mk_team(team_id="100"):
    return Team.objects.create(
        team_id=team_id,
        full_name="Test Team",
        abbreviation="TST",
        nickname="Tests",
        city="TC",
        state="TS",
        year_founded=1990,
        logo="http://example.com/logo.png",
    )


def _mk_player(team, pid="200", **extra):
    defaults = {
        "player_id": pid,
        "full_name": "Active Player",
        "first_name": "Active",
        "last_name": "Player",
        "team": team,
        "jersey": "9",
        "is_active": True,
        "headshot": "http://example.com/h.png",
        "year_start": "2020",
        "year_end": "2030",
    }
    defaults.update(extra)
    return Player.objects.create(**defaults)


def _mk_stat(player, season="2025-26", **vals):
    data = {"ppg": Decimal("22.0"), "rpg": Decimal("8.0"), "apg": Decimal("6.0")}
    data.update(vals)
    return Statistic.objects.create(player=player, season=season, **data)


def _mk_standing(team, season="2025-26"):
    return Standing.objects.create(
        team=team,
        season=season,
        conference="West",
        conference_record="10-5",
        division_record="8-2",
        wins=42,
        losses=30,
        winrate=Decimal("0.583"),
        home="22-14",
        road="18-14",
        last10="6-4",
        overtime="1",
        winstreak="W2",
    )


class PlayerAndTeamViewsTests(TestCase):
    databases = {"default"}

    def setUp(self):
        self.client = APIClient()

    def test_player_list_paginated_shape(self):
        t = _mk_team("501")
        _mk_player(t, pid="501-p")
        r = self.client.get("/api/player")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertIn("results", r.json())

    def test_team_list(self):
        _mk_team("502")
        r = self.client.get("/api/team")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(r.json()), 1)

    def test_player_detail(self):
        t = _mk_team("503")
        _mk_player(t, pid="503-p")
        r = self.client.get("/api/player/503-p")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(r.json()["player_id"], "503-p")

    def test_player_detail_404(self):
        r = self.client.get("/api/player/999999999")
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)

    def test_player_list_filters_name_team_and_active(self):
        home = _mk_team("510")
        other = _mk_team("511")
        other.abbreviation = "OTH"
        other.full_name = "Other Club"
        other.save()
        _mk_player(home, pid="510-a", full_name="Alice Jones", first_name="Alice", last_name="Jones")
        _mk_player(
            other,
            pid="511-b",
            full_name="Bob Jones",
            first_name="Bob",
            last_name="Jones",
            is_active=False,
        )
        by_name = self.client.get("/api/player?name=alice")
        self.assertEqual([row["player_id"] for row in by_name.json()["results"]], ["510-a"])
        accented = _mk_player(
            home,
            pid="510-c",
            full_name="Nikola Jokić",
            first_name="Nikola",
            last_name="Jokić",
        )
        folded = self.client.get("/api/player?name=jokic")
        self.assertEqual([row["player_id"] for row in folded.json()["results"]], [accented.player_id])
        by_team = self.client.get("/api/player?team=OTH")
        self.assertEqual([row["player_id"] for row in by_team.json()["results"]], ["511-b"])
        active = self.client.get("/api/player?active=true&name=jones")
        self.assertEqual([row["player_id"] for row in active.json()["results"]], ["510-a"])

    def test_player_list_bad_active(self):
        r = self.client.get("/api/player?active=maybe")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_statistic_season_ordering(self):
        team = _mk_team("700")
        alpha = _mk_player(team, pid="700-a", full_name="Alpha")
        beta = _mk_player(team, pid="700-b", full_name="Beta")
        _mk_stat(alpha, ppg=Decimal("10.0"))
        _mk_stat(beta, ppg=Decimal("30.0"))
        _mk_stat(alpha, season="2020-21", ppg=Decimal("99.0"))
        r = self.client.get("/api/statistic?season=2025-26&ordering=-ppg")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        rows = r.json()["results"]
        self.assertEqual([row["player"] for row in rows], ["700-b", "700-a"])
        self.assertEqual(rows[0]["team_abbreviation"], "TST")
        self.assertEqual(rows[0]["ppg"], "30.0")

    def test_statistic_bad_ordering(self):
        r = self.client.get("/api/statistic?ordering=drop")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_statistic_current_season_excludes_inactive(self):
        team = _mk_team("701")
        retired = _mk_player(
            team,
            pid="701-r",
            full_name="Retired Star",
            is_active=False,
            year_start="1959",
            year_end="1972",
        )
        _mk_stat(retired, ppg=Decimal("50.0"))
        active = _mk_player(team, pid="701-a", full_name="Active Star")
        _mk_stat(active, ppg=Decimal("10.0"))
        rows = self.client.get("/api/statistic?season=2025-26&ordering=-ppg").json()["results"]
        self.assertEqual([row["player"] for row in rows], ["701-a"])


class StatLeaderTests(TestCase):
    databases = {"default"}

    def setUp(self):
        self.client = APIClient()

    def test_invalid_category_returns_400(self):
        r = self.client.get("/api/leaders/2025-26/not_a_stat")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_leaders_ordered_and_limit(self):
        t = _mk_team("600")
        lo = _mk_player(t, pid="601", full_name="Low Scorer", last_name="Low")
        hi = _mk_player(t, pid="602", full_name="High Scorer", last_name="High")
        _mk_stat(lo, ppg=Decimal("10.0"))
        _mk_stat(hi, ppg=Decimal("30.0"))
        r = self.client.get("/api/leaders/2025-26/points_per_game", {"limit": "1"})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        rows = r.json()
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["player"], hi.player_id)

    def test_bad_limit_falls_back_to_default(self):
        t = _mk_team("601")
        for i in range(12):
            p = _mk_player(t, pid=f"602-{i}", full_name=f"P{i}", last_name=str(i))
            _mk_stat(p, ppg=Decimal(str(i)))
        r = self.client.get("/api/leaders/2025-26/points_per_game", {"limit": "not-int"})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertLessEqual(len(r.json()), 10)

    def test_leaders_current_campaign_excludes_inactive_even_if_career_span_overlaps(self):
        t = _mk_team("603")
        active = _mk_player(t, pid="603-a", full_name="Active Leader", last_name="A")
        inactive = _mk_player(
            t,
            pid="603-i",
            full_name="Inactive Leader",
            last_name="I",
            year_start="2020",
            year_end="2030",
            is_active=False,
        )
        _mk_stat(active, ppg=Decimal("15.0"))
        _mk_stat(inactive, ppg=Decimal("99.0"))
        r = self.client.get("/api/leaders/2025-26/points_per_game", {"limit": "10"})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        ids = [row["player"] for row in r.json()]
        self.assertIn("603-a", ids)
        self.assertNotIn("603-i", ids)

    def test_leaders_historical_season_does_not_use_current_is_active_flag(self):
        t = _mk_team("604")
        retired_now = _mk_player(
            t,
            pid="604-old",
            full_name="Old Star",
            last_name="O",
            year_start="2010",
            year_end="2018",
            is_active=False,
        )
        _mk_stat(retired_now, season="2015-16", ppg=Decimal("42.0"))
        r = self.client.get("/api/leaders/2015-16/points_per_game", {"limit": "10"})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        ids = [row["player"] for row in r.json()]
        self.assertIn("604-old", ids)

        
class ComparisonSummaryTests(TestCase):
    databases = {"default"}

    def setUp(self):
        self.client = APIClient()

    def test_team_compare_404_when_missing_standing(self):
        _mk_team("701")
        _mk_team("702")
        r = self.client.get("/api/team/compare/701/702/2025-26")
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)

    def test_team_compare_200(self):
        a = _mk_team("703")
        b = _mk_team("704")
        _mk_standing(a)
        _mk_standing(b)
        r = self.client.get("/api/team/compare/703/704/2025-26")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        body = r.json()
        self.assertIn("team_1", body)
        self.assertEqual(body["team_1"]["team"], "703")

    def test_season_summary_resolution(self):
        t = _mk_team("705")
        _mk_standing(t)
        r = self.client.get("/api/season/2025-26/summary")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(r.json()["season"], "2025-26")


class CareerAndRosterTests(TestCase):
    databases = {"default"}

    def setUp(self):
        self.client = APIClient()

    def test_player_career_summary_no_stats_404(self):
        t = _mk_team("801")
        _mk_player(t, pid="801-p")
        r = self.client.get("/api/player/801-p/career-summary")
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)

    def test_player_career_summary_200(self):
        t = _mk_team("802")
        p = _mk_player(t, pid="802-p")
        _mk_stat(p)
        r = self.client.get("/api/player/802-p/career-summary")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        body = r.json()
        self.assertEqual(body["player_id"], "802-p")
        self.assertIn("career_summary", body)

    @patch("core.views.SEASON", "2025-26")
    def test_team_roster_current_excludes_career_outside_season(self):
        t = _mk_team("803")
        active = _mk_player(t, pid="803-a")
        retired = _mk_player(
            t,
            pid="803-r",
            full_name="Old Vet",
            last_name="Vet",
            year_start="1999",
            year_end="2020",
            is_active=False,
        )
        _mk_stat(active)
        _mk_stat(retired)
        r = self.client.get("/api/team/803/roster/current")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        ids = {row["player_id"] for row in r.json()["roster"]}
        self.assertIn("803-a", ids)
        self.assertNotIn("803-r", ids)

    @patch("core.views.SEASON", "2025-26")
    def test_team_roster_current_excludes_inactive_even_if_career_span_overlaps(self):
        t = _mk_team("805")
        active = _mk_player(t, pid="805-a")
        waived = _mk_player(
            t,
            pid="805-w",
            full_name="Waived Guy",
            last_name="Guy",
            year_start="2020",
            year_end="2030",
            is_active=False,
        )
        _mk_stat(active)
        _mk_stat(waived)
        r = self.client.get("/api/team/805/roster/current")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        ids = {row["player_id"] for row in r.json()["roster"]}
        self.assertIn("805-a", ids)
        self.assertNotIn("805-w", ids)

    @patch("core.views.SEASON", "2025-26")
    def test_team_roster_season_current_campaign_includes_inactive(self):
        """Season search for the env campaign includes waived/inactive with stats."""
        t = _mk_team("806")
        active = _mk_player(t, pid="806-a")
        waived = _mk_player(
            t,
            pid="806-w",
            full_name="Waived",
            last_name="Player",
            is_active=False,
        )
        _mk_stat(active, team=t)
        _mk_stat(waived, team=t)
        r = self.client.get("/api/team/806/roster/2025-26")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        body = r.json()
        ids = {row["player_id"] for row in body["roster"]}
        self.assertIn("806-a", ids)
        self.assertIn("806-w", ids)
        self.assertEqual(body["roster_scope"], "stat_team_season")

    @patch("core.views.SEASON", "2025-26")
    def test_team_roster_season_uses_stat_franchise_not_only_player_team(self):
        """Roster for a season follows ``Statistic.team``, not only ``Player.team``."""
        indiana = _mk_team("830")
        other = _mk_team("831")
        p = _mk_player(other, pid="830-p", year_start="2019", year_end="2030")
        _mk_stat(p, season="2025-26", team=indiana)
        r = self.client.get("/api/team/830/roster/2025-26")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        ids = {row["player_id"] for row in r.json()["roster"]}
        self.assertIn("830-p", ids)

    @patch("core.views.SEASON", "2025-26")
    def test_team_roster_season_excludes_when_stat_line_is_for_other_franchise(self):
        """Assigned to this franchise but stats for another team that season — not listed."""
        indiana = _mk_team("832")
        other = _mk_team("833")
        p = _mk_player(indiana, pid="832-p", year_start="2019", year_end="2030")
        _mk_stat(p, season="2025-26", team=other)
        r = self.client.get("/api/team/832/roster/2025-26")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        ids = {row["player_id"] for row in r.json()["roster"]}
        self.assertNotIn("832-p", ids)

    def test_team_roster_full_lists_assignments(self):
        t = _mk_team("804")
        _mk_player(t, pid="804-a")
        r = self.client.get("/api/team/804/roster")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(r.json()["roster_size"], 1)


class SearchTests(TestCase):
    databases = {"default"}

    def setUp(self):
        self.client = APIClient()

    def test_player_search_by_name(self):
        t = _mk_team("901")
        _mk_player(t, pid="901-x", full_name="Unique Basketball Name")
        r = self.client.get("/api/player/search/", {"name": "Unique Basketball"})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        names = [row["full_name"] for row in r.json()]
        self.assertTrue(any("Unique" in n for n in names))
