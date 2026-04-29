"""
REST API views for NBA player, team, statistic, and standing resources.

Endpoints are registered under ``/api/`` (see ``core.urls``). The active league
season for "current roster" is read from the ``SEASON`` environment variable
at import time (see ``SEASON`` below).
"""

import os

from django.db.models import Avg, IntegerField, Q
from django.db.models.functions import Cast
from django.http import Http404
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from .models import Player, Standing, Statistic, Team
from .season_utils import (
    resolved_season_label,
    resolve_season_start_year,
    season_lookup_variants,
    stats_within_career_years,
)
from .serializers import (
    PlayerSerializer,
    StandingSerializer,
    StatisticSerializer,
    TeamSerializer,
)

SEASON = (os.environ.get("SEASON") or "2025-26").strip()

STAT_LEADER_FIELDS = {
    "points_per_game": "ppg",
    "assists_per_game": "apg",
    "rebounds_per_game": "rpg",
}


class StandardPagination(PageNumberPagination):
    """Default page size and bounds for paginated list endpoints."""

    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


def _paginated_response(request, queryset, serializer_cls):
    """Return a DRF paginated JSON response for ``queryset`` using ``serializer_cls`` (many=True)."""

    paginator = StandardPagination()
    page = paginator.paginate_queryset(queryset, request)
    serializer = serializer_cls(page, many=True)
    return paginator.get_paginated_response(serializer.data)


def _team_optional(team_id):
    """Return ``Team`` by primary key string, or ``None`` if missing."""
    return Team.objects.filter(team_id=str(team_id)).first()


def _stat_avg_one_decimal(val):
    """Round a stat average (e.g. from ``Avg`` aggregation) to one decimal place."""

    if val is None:
        return None
    return round(float(val), 1)


def _parse_limit(request, default=10, maximum=None):
    """
    Parse the ``limit`` query string as a positive integer, capped at ``maximum``.

    Non-integer or non-positive values return ``default``.
    """

    if maximum is None:
        maximum = StandardPagination.max_page_size
    raw = request.query_params.get("limit", default)
    try:
        n = int(raw)
    except (TypeError, ValueError):
        return default
    if n < 1:
        return default
    return min(n, maximum)


def _players_active_in_league_year(players_queryset, league_year):
    """
    Players whose career [year_start, year_end] includes the NBA league start year
    (e.g. 2025 for season key 2025-26). Non-numeric career years are excluded.
    """

    if league_year is None:
        return players_queryset
    return (
        players_queryset.filter(
            year_start__regex=r"^[0-9]+$",
            year_end__regex=r"^[0-9]+$",
        )
        .annotate(
            _career_start=Cast("year_start", output_field=IntegerField()),
            _career_end=Cast("year_end", output_field=IntegerField()),
        )
        .filter(
            _career_start__lte=league_year,
            _career_end__gte=league_year,
        )
    )


def _same_league_campaign_as_env(season_param):
    """
    True when ``season_param`` resolves to the same NBA league-start year as ``SEASON``.

    ``Player.is_active`` reflects *today's* roster status. Applying it when answering
    "who led the league in 2015-16?" would wrongly drop retired players who were
    active that year. So for any *other* league year we still use career
    ``year_start`` / ``year_end`` overlap; for the **current** configured campaign
    (same year as ``SEASON``), we trust ``is_active`` and skip the career window.
    """

    env_key = SEASON.strip()
    req_key = str(season_param).strip()
    if not env_key or not req_key:
        return False
    env_vars = list(dict.fromkeys(season_lookup_variants(env_key)))
    req_vars = list(dict.fromkeys(season_lookup_variants(req_key)))
    y_env = resolve_season_start_year(env_key, env_vars)
    y_req = resolve_season_start_year(req_key, req_vars)
    return y_env is not None and y_req is not None and y_env == y_req


def _statistics_players_active_in_season(queryset, season_y):
    """
    Statistic rows only for players whose career [year_start, year_end]
    includes the league year season_y (e.g. 2025 for season key 2025-26).
    """

    if season_y is None:
        return queryset
    return (
        queryset.filter(
            player__year_start__regex=r"^[0-9]+$",
            player__year_end__regex=r"^[0-9]+$",
        )
        .annotate(
            _career_start=Cast("player__year_start", output_field=IntegerField()),
            _career_end=Cast("player__year_end", output_field=IntegerField()),
        )
        .filter(
            _career_start__lte=season_y,
            _career_end__gte=season_y,
        )
    )


def _standing_for_team_season_or_404(team_id, variants):
    """
    Load one ``Standing`` row for (``team_id``, season in ``variants``).

    Raises ``Http404`` if no row exists. Duplicate season string variants (e.g.
    ``2025`` vs ``2025-26``) resolve via ``.first()`` so at most one row is returned.
    """

    standing = (
        Standing.objects.select_related("team")
        .filter(team_id=team_id, season__in=variants)
        .order_by("season", "pk")
        .first()
    )
    if standing is None:
        raise Http404("No Standing matches the given query.")
    return standing


@api_view(["GET"])
def player_list(request):
    """Paginated list of all players (query params ``page``, ``page_size``)."""

    players = Player.objects.all().order_by("full_name", "player_id")
    return _paginated_response(request, players, PlayerSerializer)


@api_view(["GET"])
def team_list(request):
    """Return every team record (not paginated)."""

    teams = Team.objects.all().order_by("pk")
    serializer = TeamSerializer(teams, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def statistic_list(request):
    """Paginated index of player statistic rows (``page``, ``page_size``)."""

    statistics = Statistic.objects.all().select_related("player").order_by("pk")
    return _paginated_response(request, statistics, StatisticSerializer)


@api_view(["GET"])
def standing_list(request):
    """Paginated index of team standings rows (``page``, ``page_size``)."""

    standings = Standing.objects.all().select_related("team").order_by("pk")
    return _paginated_response(request, standings, StandingSerializer)


@api_view(["GET"])
def player_id(request, player_id):
    """Return serialized ``Player`` data for ``player_id`` (404 if unknown)."""

    player = get_object_or_404(Player, player_id=player_id)
    serializer = PlayerSerializer(player)
    return Response(serializer.data)


@api_view(["GET"])
def team_id(request, team_id):
    """Return serialized ``Team`` data for ``team_id`` (404 if unknown)."""

    team = get_object_or_404(Team, team_id=team_id)
    serializer = TeamSerializer(team)
    return Response(serializer.data)


@api_view(["GET"])
def player_statistic(request, player_id):
    """Return all ``Statistic`` rows for ``player_id``, sorted by ``season``."""

    player_statistics = Statistic.objects.filter(player_id=player_id).order_by("season")
    serializer = StatisticSerializer(player_statistics, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def team_standing(request, team_id):
    """Return all ``Standing`` rows for ``team_id``, sorted by ``season``."""

    team_standings = Standing.objects.filter(team_id=team_id).select_related("team").order_by(
        "season"
    )
    serializer = StandingSerializer(team_standings, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def player_statistic_season(request, player_id, season):
    """
    Statistics for ``player_id`` limited to ``season``.

    Accepts four-digit years or hyphenated NBA keys; season variants match stored rows.
    """

    variants = season_lookup_variants(season)
    player_statistics = Statistic.objects.filter(player_id=player_id, season__in=variants).order_by(
        "season"
    )
    serializer = StatisticSerializer(player_statistics, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def team_standing_season(request, team_id, season):
    """
    Standings for ``team_id`` limited to ``season``.

    Accepts four-digit years or hyphenated NBA keys; season variants match stored rows.
    """

    variants = season_lookup_variants(season)
    team_standings = (
        Standing.objects.filter(team_id=team_id, season__in=variants)
        .select_related("team")
        .order_by("season")
    )
    serializer = StandingSerializer(team_standings, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def player_search(request):
    """
    Filter players using optional ``name`` and ``team`` query parameters.

    ``name`` matches ``full_name``, ``first_name``, or ``last_name`` (case-insensitive).
    ``team`` matches franchise ``full_name``, ``nickname``, or ``abbreviation``.
    Results are sorted by ``full_name``.
    """

    name = request.query_params.get("name")
    team = request.query_params.get("team")

    players = Player.objects.select_related("team").all()
    if name:
        n = name.strip()
        if n:
            players = players.filter(
                Q(full_name__icontains=n)
                | Q(first_name__icontains=n)
                | Q(last_name__icontains=n)
            )
    if team:
        t = team.strip()
        if t:
            players = players.filter(
                Q(team__full_name__icontains=t)
                | Q(team__nickname__icontains=t)
                | Q(team__abbreviation__icontains=t)
            )

    serializer = PlayerSerializer(players.order_by("full_name"), many=True)
    return Response(serializer.data)


@api_view(["GET"])
def stat_leaders(request, season, stat_category):
    """
    Top ``Statistic`` rows for ``season`` by the chosen per-game category.

    ``stat_category`` must be ``points_per_game``, ``assists_per_game``, or
    ``rebounds_per_game``. Optional query ``limit`` (default 10, maximum 100).
    Null stat values are excluded.

    For the league year matching ``SEASON`` (current campaign), only statistics for
    ``Player.is_active`` players are considered. Older seasons still filter by
    career ``year_start``/``year_end`` overlap with that season's league year.
    """

    if stat_category not in STAT_LEADER_FIELDS:
        valid = list(STAT_LEADER_FIELDS.keys())
        return Response({"error": f"Invalid category. Choose from {valid}"}, status=400)

    limit = _parse_limit(request)
    field = STAT_LEADER_FIELDS[stat_category]
    variants = season_lookup_variants(season)
    season_y = resolve_season_start_year(season, variants)
    season_param = str(season).strip()

    leaders = (
        Statistic.objects.select_related("player")
        .filter(season__in=variants)
        .filter(**{f"{field}__isnull": False})
    )
    if _same_league_campaign_as_env(season_param):
        leaders = leaders.filter(player__is_active=True)
    else:
        leaders = _statistics_players_active_in_season(leaders, season_y)
    leaders = leaders.order_by(f"-{field}")[:limit]
    serializer = StatisticSerializer(leaders, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def team_compare(request, team_id_1, team_id_2, season):
    """
    Compare two franchises' ``Standing`` rows for the same ``season``.

    Returns 404 when either team lacks a standing for that season.
    """

    variants = season_lookup_variants(season)
    team1 = _standing_for_team_season_or_404(team_id_1, variants)
    team2 = _standing_for_team_season_or_404(team_id_2, variants)

    return Response(
        {
            "team_1": StandingSerializer(team1).data,
            "team_2": StandingSerializer(team2).data,
        }
    )


@api_view(["GET"])
def player_career_summary(request, player_id):
    """
    Career averages plus a per-season breakdown for ``player_id``.

    Statistic rows are limited to seasons whose league year falls within
    ``Player.year_start``..``Player.year_end``. Responds with 404 when there is
    no data in that window.
    """

    player = get_object_or_404(Player, player_id=player_id)
    stats = Statistic.objects.filter(player_id=player_id)
    if not stats.exists():
        return Response({"error": "No stats found"}, status=404)

    career_stats = stats_within_career_years(stats, player.year_start, player.year_end)
    if not career_stats.exists():
        return Response({"error": "No stats found"}, status=404)

    aggregated = career_stats.aggregate(
        avg_points=Avg("ppg"),
        avg_assists=Avg("apg"),
        avg_rebounds=Avg("rpg"),
    )
    best_scoring = (
        career_stats.exclude(ppg__isnull=True)
        .order_by("-ppg", "season")
        .values("season", "ppg")
        .first()
    )

    summary = {
        "avg_points": _stat_avg_one_decimal(aggregated["avg_points"]),
        "avg_assists": _stat_avg_one_decimal(aggregated["avg_assists"]),
        "avg_rebounds": _stat_avg_one_decimal(aggregated["avg_rebounds"]),
        "best_scoring_season": (
            {
                "season": best_scoring["season"],
                "ppg": _stat_avg_one_decimal(best_scoring["ppg"]),
            }
            if best_scoring is not None
            else None
        ),
        "seasons_count": career_stats.count(),
    }

    serializer = StatisticSerializer(career_stats, many=True)
    return Response(
        {
            "player_id": player_id,
            "year_start": player.year_start,
            "year_end": player.year_end,
            "career_summary": summary,
            "season_breakdown": serializer.data,
        }
    )


@api_view(["GET"])
def team_roster_current(request, team_id):
    """
    Franchise roster tied to the configured ``SEASON`` (``SEASON`` in ``.env``).

    Players must have statistics for that season and ``Player.is_active`` True.
    Career ``year_start``/``year_end`` are not used here so waived or inactive
    players are omitted even when ``year_end`` still covers the league year.
    """

    tid = str(team_id)
    team = _team_optional(tid)

    season_key = SEASON
    variants = list(dict.fromkeys(season_lookup_variants(season_key)))

    players_qs = (
        Player.objects.filter(team_id=tid, is_active=True)
        .filter(statistics__season__in=variants)
        .select_related("team")
        .distinct()
        .order_by("full_name")
    )

    serializer = PlayerSerializer(players_qs, many=True)
    return Response(
        {
            "team": TeamSerializer(team).data if team is not None else None,
            "season": season_key,
            "roster": serializer.data,
            "roster_size": players_qs.count(),
            "roster_scope": "active_only",
        }
    )


@api_view(["GET"])
def team_roster_season(request, team_id, season):
    """
    Franchise roster for an arbitrary NBA ``season`` key (e.g. ``2024`` or ``2025-26``).

    When ``season`` matches the league year of ``SEASON`` (current campaign),
    results use ``Player.is_active`` only (same rules as ``team_roster_current``).
    For older seasons, inclusion uses career ``year_start``/``year_end`` overlap.
    """

    tid = str(team_id)
    team = _team_optional(tid)
    season_key = str(season).strip()
    if not season_key:
        return Response({"error": "Season is required"}, status=400)

    variants = list(dict.fromkeys(season_lookup_variants(season_key)))
    league_y = resolve_season_start_year(season_key, variants)

    players_qs = (
        Player.objects.filter(team_id=tid)
        .filter(statistics__season__in=variants)
        .select_related("team")
        .distinct()
    )
    if _same_league_campaign_as_env(season_key):
        players_qs = players_qs.filter(is_active=True)
        roster_scope = "active_only"
    else:
        players_qs = _players_active_in_league_year(players_qs, league_y)
        roster_scope = "career_years"
    players_qs = players_qs.order_by("full_name")

    serializer = PlayerSerializer(players_qs, many=True)
    return Response(
        {
            "team": TeamSerializer(team).data if team is not None else None,
            "season": resolved_season_label(variants) if variants else season_key,
            "roster": serializer.data,
            "roster_size": players_qs.count(),
            "roster_scope": roster_scope,
        }
    )


@api_view(["GET"])
def team_roster(request, team_id):
    """List every ``Player`` currently assigned to ``team_id`` (no season filter)."""

    tid = str(team_id)
    team = _team_optional(tid)
    players = Player.objects.filter(team_id=tid).select_related("team").order_by("full_name")
    return Response(
        {
            "team": TeamSerializer(team).data if team is not None else None,
            "roster": PlayerSerializer(players, many=True).data,
            "roster_size": players.count(),
        }
    )


@api_view(["GET"])
def season_summary(request, season):
    """
    All team standings for ``season``, sorted by wins (highest first).

    The response ``season`` field uses the hyphenated NBA label when both bare
    year and hyphenated variants are available.
    """

    variants = season_lookup_variants(season)
    standings = (
        Standing.objects.filter(season__in=variants)
        .select_related("team")
        .order_by("-wins")
    )

    return Response(
        {
            "season": resolved_season_label(variants),
            "standings": StandingSerializer(standings, many=True).data,
        }
    )
