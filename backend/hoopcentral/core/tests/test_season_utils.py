from decimal import Decimal

from django.test import TestCase

from core.models import Player, Statistic, Team
from core.season_utils import (
    resolved_season_label,
    resolve_season_start_year,
    season_lookup_variants,
    season_start_year,
    stats_within_career_years,
)


class SeasonParsingTests(TestCase):
    databases = {"default"}

    def test_season_start_year_hyphenated(self):
        self.assertEqual(season_start_year("2025-26"), 2025)

    def test_season_start_year_four_digit(self):
        self.assertEqual(season_start_year("2025"), 2025)

    def test_season_start_year_empty(self):
        self.assertIsNone(season_start_year(None))
        self.assertIsNone(season_start_year(""))

    def test_season_lookup_variants_four_digit_expands(self):
        v = season_lookup_variants("2025")
        self.assertIn("2025", v)
        self.assertIn("2025-26", v)

    def test_resolve_season_start_year(self):
        variants = season_lookup_variants("2024-25")
        self.assertEqual(resolve_season_start_year("2024-25", variants), 2024)

    def test_resolved_season_label_prefers_hyphenated(self):
        variants = ["2025-26", "2025"]
        self.assertEqual(resolved_season_label(variants), "2025-26")

    def test_resolved_season_label_single(self):
        self.assertEqual(resolved_season_label(["2025-26"]), "2025-26")


class StatsWithinCareerYearsTests(TestCase):
    databases = {"default"}

    def _fixture_player_and_stats(self):
        team = Team.objects.create(
            team_id="900",
            full_name="T",
            abbreviation="T",
            nickname="T",
            city="X",
            state="Y",
            year_founded=1990,
            logo="http://example.com/l.png",
        )
        player = Player.objects.create(
            player_id="sp1",
            full_name="Career Stat Player",
            first_name="Career",
            last_name="Stat",
            team=team,
            jersey="1",
            is_active=True,
            headshot="http://example.com/h.png",
            year_start="2020",
            year_end="2022",
        )
        Statistic.objects.create(
            player=player,
            season="2020-21",
            ppg=Decimal("10.0"),
            rpg=Decimal("5.0"),
            apg=Decimal("3.0"),
        )
        Statistic.objects.create(
            player=player,
            season="2025-26",
            ppg=Decimal("15.0"),
            rpg=Decimal("6.0"),
            apg=Decimal("4.0"),
        )
        return player

    def test_filters_by_career_window(self):
        self._fixture_player_and_stats()
        qs = Statistic.objects.all()
        filtered = stats_within_career_years(qs, "2020", "2022")
        seasons = set(filtered.values_list("season", flat=True))
        self.assertEqual(seasons, {"2020-21"})
        self.assertFalse(filtered.filter(season="2025-26").exists())
