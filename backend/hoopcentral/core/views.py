import os

from django.db.models import Avg, IntegerField, Q
from django.db.models.functions import Cast
from django.http import Http404
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from .models import Player, Standing, Statistic, Team
from .serializers import (
    PlayerSerializer,
    StandingSerializer,
    StatisticSerializer,
    TeamSerializer,
)

SEASON = (os.environ.get("SEASON") or "2025-26").strip()


class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


def _season_start_year(season):
    """NBA season keys (e.g. '2024-25') → first calendar year of that league year."""
    if not season:
        return None
    season = str(season).strip()
    if "-" in season:
        head = season.split("-", 1)[0].strip()
        if head.isdigit():
            return int(head)
        return None
    if season.isdigit() and len(season) >= 4:
        return int(season[:4])
    return None


def _stats_within_career_years(queryset, year_start, year_end):
    """
    Statistic rows whose season's league start year is in [year_start, year_end]
    (inclusive). Uses the same season-year rules as _season_start_year.
    If years are not valid integers, returns queryset ordered by season unchanged.
    """
    try:
        ymin = int(str(year_start).strip())
    except (TypeError, ValueError):
        ymin = None
    try:
        ymax = int(str(year_end).strip())
    except (TypeError, ValueError):
        ymax = None

    if ymin is None and ymax is None:
        return queryset.order_by("season")

    pks = []
    for pk, season in queryset.values_list("pk", "season"):
        y = _season_start_year(season)
        if y is None:
            continue
        if ymin is not None and y < ymin:
            continue
        if ymax is not None and y > ymax:
            continue
        pks.append(pk)
    return queryset.filter(pk__in=pks).order_by("season")


def _season_lookup_variants(season_param):
    """
    Match season rows whether the client sends a start year ('2000') or NBA-style
    key ('2000-01'). Both forms are included so filters work either way.
    """
    raw = str(season_param).strip()
    if not raw:
        return [raw]
    variants = [raw]
    if raw.isdigit() and len(raw) == 4:
        y = int(raw)
        variants.append(f"{y}-{str(y + 1)[-2:]}")
    elif "-" in raw:
        head = raw.split("-", 1)[0].strip()
        if head.isdigit() and len(head) == 4:
            variants.append(head)
    return list(dict.fromkeys(variants))


def _resolve_season_start_year(season_param, variants):
    """League start calendar year for the requested season (see _season_start_year)."""
    for v in variants:
        y = _season_start_year(v)
        if y is not None:
            return y
    return _season_start_year(str(season_param).strip())


def _stat_avg_one_decimal(val):
    """Round a stat average (e.g. from Avg aggregation) to one decimal place."""
    if val is None:
        return None
    return round(float(val), 1)


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


def _statistics_players_active_in_season(queryset, season_y):
    """
    Keep Statistic rows only for players whose career [year_start, year_end]
    includes the league year season_y (e.g. 2025 for season key 2025-26).
    Non-numeric year fields are excluded.
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
    One Standing for (team_id, season variants). Uses .first() so duplicate rows
    that only differ by season string (e.g. 2000 vs 2000-01) do not raise
    MultipleObjectsReturned.
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
    players = Player.objects.all()
    paginator = StandardPagination()
    result = paginator.paginate_queryset(players, request)
    serializer = PlayerSerializer(result, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(["GET"])
def team_list(request):
    """Returns all teams"""

    teams = Team.objects.all()
    serializer = TeamSerializer(teams, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def statistic_list(request):
    """Paginated player statistics index (`page`, `page_size` — same semantics as `/player`)."""
    statistics = Statistic.objects.all().select_related("player").order_by("pk")
    paginator = StandardPagination()
    result = paginator.paginate_queryset(statistics, request)
    serializer = StatisticSerializer(result, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(["GET"])
def standing_list(request):
    """Paginated team standings index (`page`, `page_size` — same semantics as `/player`)."""
    standings = Standing.objects.all().select_related("team").order_by("pk")
    paginator = StandardPagination()
    result = paginator.paginate_queryset(standings, request)
    serializer = StandingSerializer(result, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(["GET"])
def player_id(request, player_id):
    """Return a player"""

    player = get_object_or_404(Player, player_id=player_id)
    serializer = PlayerSerializer(player)
    return Response(serializer.data)


@api_view(["GET"])
def team_id(request, team_id):
    """Return a team"""

    team = get_object_or_404(Team, team_id=team_id)
    serializer = TeamSerializer(team)
    return Response(serializer.data)


@api_view(["GET"])
def player_statistic(request, player_id):
    """Return a player statistic"""

    player_statistics = Statistic.objects.filter(player_id=player_id)
    serializer = StatisticSerializer(player_statistics, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def team_standing(request, team_id):
    """Return a team standing"""

    team_standings = Standing.objects.filter(team_id=team_id).select_related("team")
    serializer = StandingSerializer(team_standings, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def player_statistic_season(request, player_id, season):
    """Return a player statistic by season"""

    variants = _season_lookup_variants(season)
    player_statistics = Statistic.objects.filter(
        player_id=player_id, season__in=variants
    )
    serializer = StatisticSerializer(player_statistics, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def team_standing_season(request, team_id, season):
    """Return a team standing by season"""

    variants = _season_lookup_variants(season)
    team_standings = Standing.objects.filter(
        team_id=team_id, season__in=variants
    ).select_related("team")
    serializer = StandingSerializer(team_standings, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def player_search(request):
    """Search players by name and/or NBA team name (full name, nickname, abbreviation)."""
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

    serializer = PlayerSerializer(players, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def stat_leaders(request, season, stat_category):
    """
    Get top players by stat category
    e.g. /leaders/2024/points_per_game/?limit=10
    """
    limit = int(request.query_params.get("limit", 10))
    # API names map to Statistic model fields (ppg, apg, rpg)
    category_field = {
        "points_per_game": "ppg",
        "assists_per_game": "apg",
        "rebounds_per_game": "rpg",
    }
    valid_categories = list(category_field.keys())

    if stat_category not in valid_categories:
        return Response(
            {"error": f"Invalid category. Choose from {valid_categories}"},
            status=400,
        )

    field = category_field[stat_category]
    variants = _season_lookup_variants(season)
    season_y = _resolve_season_start_year(season, variants)
    # Desc order on nullable fields puts NULLs first in PostgreSQL; exclude them so
    # leaders reflect real values (applies to ppg, apg, rpg separately).
    leaders = (
        Statistic.objects.select_related("player")
        .filter(season__in=variants)
        .filter(**{f"{field}__isnull": False})
    )
    leaders = _statistics_players_active_in_season(leaders, season_y)
    leaders = leaders.order_by(f"-{field}")[:limit]
    serializer = StatisticSerializer(leaders, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def team_compare(request, team_id_1, team_id_2, season):
    """Compare two teams' standings and stats side by side"""
    variants = _season_lookup_variants(season)
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
    """Career averages and per-season stats within player's year_start..year_end."""

    player = get_object_or_404(Player, player_id=player_id)
    stats = Statistic.objects.filter(player_id=player_id)
    if not stats.exists():
        return Response({"error": "No stats found"}, status=404)

    career_stats = _stats_within_career_years(stats, player.year_start, player.year_end)
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
    Current roster for `SEASON` (from `.env` `SEASON`, same as ingestion scripts): players
    assigned to the team with a stat line for that season whose career years still include
    that league year.
    """
    tid = str(team_id)
    team = Team.objects.filter(team_id=tid).first()

    season_key = SEASON
    variants = list(dict.fromkeys(_season_lookup_variants(season_key)))
    league_y = _resolve_season_start_year(season_key, variants)

    players_qs = (
        Player.objects.filter(team_id=tid)
        .filter(statistics__season__in=variants)
        .select_related("team")
        .distinct()
    )
    players_qs = _players_active_in_league_year(players_qs, league_y).order_by("full_name")

    serializer = PlayerSerializer(players_qs, many=True)
    return Response(
        {
            "team": TeamSerializer(team).data if team is not None else None,
            "season": season_key,
            "roster": serializer.data,
            "roster_size": players_qs.count(),
        }
    )


@api_view(["GET"])
def team_roster(request, team_id):
    """Historical roster: all players currently assigned (`Player.team_id`) to this franchise."""
    tid = str(team_id)
    team = Team.objects.filter(team_id=tid).first()
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
    """Overview of an entire season"""

    variants = _season_lookup_variants(season)
    standings = (
        Standing.objects.filter(season__in=variants)
        .select_related("team")
        .order_by("-wins")
    )
    
    resolved = variants[-1] if len(variants) > 1 else variants[0]

    return Response(
        {
            "season": resolved,
            "standings": StandingSerializer(standings, many=True).data,
        }
    )
