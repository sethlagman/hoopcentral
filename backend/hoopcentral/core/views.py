"""
REST API views, mounted under ``/api/``.

``SEASON`` (the current campaign) is read from the environment at import time.
"""

import os
from datetime import datetime
import unicodedata

from django.db.models import Avg, Exists, F, IntegerField, OuterRef, Q, Value
from django.db.models.functions import Cast, Lower, Replace
from django.http import Http404
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from .models import Game, Player, Standing, Statistic, Team
from .season_utils import (
    resolved_season_label,
    resolve_season_start_year,
    season_lookup_variants,
    stats_within_career_years,
)
from .serializers import (
    GameSerializer,
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

STAT_LIST_ORDERING = {
    "ppg": "ppg",
    "-ppg": "ppg",
    "rpg": "rpg",
    "-rpg": "rpg",
    "apg": "apg",
    "-apg": "apg",
    "player": "player__full_name",
    "-player": "player__full_name",
}


class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


def _paginated_response(request, queryset, serializer_cls):
    paginator = StandardPagination()
    page = paginator.paginate_queryset(queryset, request)
    serializer = serializer_cls(page, many=True)
    return paginator.get_paginated_response(serializer.data)


def _team_optional(team_id):
    return Team.objects.filter(team_id=str(team_id)).first()


def _stat_avg_one_decimal(val):
    if val is None:
        return None
    return round(float(val), 1)


def _parse_limit(request, default=10, maximum=None):
    """Positive ``limit`` capped at ``maximum``; invalid values fall back to ``default``."""

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
    Players whose career [year_start, year_end] includes ``league_year``
    (e.g. 2025 for 2025-26). Players with non-numeric career years are excluded.
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
    True when ``season_param`` resolves to the same league-start year as ``SEASON``.

    ``Player.is_active`` reflects today's roster, so it is only trusted for the
    current campaign. Filtering past seasons by it would drop retired players;
    those use the career ``year_start``/``year_end`` window instead.
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
    """Statistic rows for players whose career [year_start, year_end] includes ``season_y``."""

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
    Rows may exist under several season spellings (``2025`` and ``2025-26``);
    ``.first()`` keeps the result to a single standing.
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


class _BadDate(Exception):
    def __init__(self, field):
        self.field = field


def _query_date(request, name):
    text = (request.query_params.get(name) or "").strip()
    if not text:
        return None
    try:
        return datetime.strptime(text, "%Y-%m-%d").date()
    except ValueError as exc:
        raise _BadDate(name) from exc


def _schedule_team_ids(team_param):
    """
    Team ids matching ``team_param`` by id or abbreviation (case-insensitive).

    ``None`` means no filter was given; an empty list means nothing matched.
    """

    text = (team_param or "").strip()
    if not text:
        return None
    ids = list(
        Team.objects.filter(Q(team_id=text) | Q(abbreviation__iexact=text)).values_list(
            "team_id", flat=True
        )
    )
    return ids


def _fold_text(value):
    text = unicodedata.normalize("NFKD", str(value or ""))
    return "".join(ch for ch in text if not unicodedata.combining(ch)).casefold()


_ACCENT_FOLDS = (
    ("á", "a"), ("à", "a"), ("ä", "a"), ("â", "a"), ("ã", "a"), ("å", "a"), ("ā", "a"),
    ("é", "e"), ("è", "e"), ("ë", "e"), ("ê", "e"), ("ě", "e"), ("ē", "e"),
    ("í", "i"), ("ì", "i"), ("ï", "i"), ("î", "i"), ("ī", "i"),
    ("ó", "o"), ("ò", "o"), ("ö", "o"), ("ô", "o"), ("õ", "o"), ("ō", "o"),
    ("ú", "u"), ("ù", "u"), ("ü", "u"), ("û", "u"), ("ū", "u"),
    ("ý", "y"), ("ÿ", "y"),
    ("ñ", "n"), ("ç", "c"), ("ć", "c"), ("č", "c"), ("š", "s"), ("ž", "z"), ("đ", "d"),
)


def _folded_column(field):
    expr = Lower(field)
    for src, dst in _ACCENT_FOLDS:
        expr = Replace(expr, Value(src), Value(dst))
    return expr


def _filter_player_name(players, name):
    folded = _fold_text(name)
    if not folded:
        return players
    return players.annotate(
        _folded_full=_folded_column("full_name"),
        _folded_first=_folded_column("first_name"),
        _folded_last=_folded_column("last_name"),
    ).filter(
        Q(_folded_full__icontains=folded)
        | Q(_folded_first__icontains=folded)
        | Q(_folded_last__icontains=folded)
    )


@api_view(["GET"])
def player_list(request):
    """
    Players ordered by name.

    Optional filters: ``name`` (full, first, or last), ``team`` (id, abbreviation,
    full name, or nickname), ``active`` (``true`` or ``false``).
    """

    players = Player.objects.select_related("team").all()
    name = (request.query_params.get("name") or "").strip()
    if name:
        players = _filter_player_name(players, name)
    team = (request.query_params.get("team") or "").strip()
    if team:
        players = players.filter(
            Q(team_id=team)
            | Q(team__abbreviation__iexact=team)
            | Q(team__full_name__icontains=team)
            | Q(team__nickname__icontains=team)
        )
    active = (request.query_params.get("active") or "").strip().lower()
    if active in ("1", "true", "yes"):
        players = players.filter(is_active=True)
    elif active in ("0", "false", "no"):
        players = players.filter(is_active=False)
    elif active:
        return Response({"error": "active must be true or false"}, status=400)
    players = players.order_by("full_name", "player_id")
    return _paginated_response(request, players, PlayerSerializer)


@api_view(["GET"])
def team_list(request):
    teams = Team.objects.all().order_by("pk")
    serializer = TeamSerializer(teams, many=True)
    return Response(serializer.data)


def _stat_list_order(key):
    desc = key.startswith("-")
    expr = F(STAT_LIST_ORDERING[key])
    ordered = expr.desc(nulls_last=True) if desc else expr.asc(nulls_last=True)
    return (ordered, "pk")


@api_view(["GET"])
def statistic_list(request):
    """
    Per-game averages. Optional ``season`` (``2025`` or ``2025-26``) and
    ``ordering`` (``ppg``, ``rpg``, ``apg``, ``player``, each with an optional
    leading ``-``). Stat sorts place nulls last. A current-season request
    keeps active players only, matching the leaders endpoint. Older seasons
    keep players whose career window covers that season.
    """

    statistics = Statistic.objects.select_related("player", "player__team", "team")
    season = (request.query_params.get("season") or "").strip()
    if season:
        variants = season_lookup_variants(season)
        statistics = statistics.filter(season__in=variants)
        if _same_league_campaign_as_env(season):
            statistics = statistics.filter(player__is_active=True)
        else:
            statistics = _statistics_players_active_in_season(
                statistics,
                resolve_season_start_year(season, variants),
            )
    ordering = (request.query_params.get("ordering") or "").strip()
    if ordering:
        if ordering not in STAT_LIST_ORDERING:
            valid = ", ".join(STAT_LIST_ORDERING)
            return Response({"error": f"Invalid ordering. Choose from {valid}"}, status=400)
        statistics = statistics.order_by(*_stat_list_order(ordering))
    else:
        statistics = statistics.order_by("pk")
    return _paginated_response(request, statistics, StatisticSerializer)


@api_view(["GET"])
def standing_list(request):
    standings = Standing.objects.all().select_related("team").order_by("pk")
    return _paginated_response(request, standings, StandingSerializer)


@api_view(["GET"])
def player_id(request, player_id):
    player = get_object_or_404(Player, player_id=player_id)
    serializer = PlayerSerializer(player)
    return Response(serializer.data)


@api_view(["GET"])
def team_id(request, team_id):
    team = get_object_or_404(Team, team_id=team_id)
    serializer = TeamSerializer(team)
    return Response(serializer.data)


@api_view(["GET"])
def player_statistic(request, player_id):
    player_statistics = Statistic.objects.filter(player_id=player_id).order_by("season")
    serializer = StatisticSerializer(player_statistics, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def team_standing(request, team_id):
    team_standings = Standing.objects.filter(team_id=team_id).select_related("team").order_by(
        "season"
    )
    serializer = StandingSerializer(team_standings, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def player_statistic_season(request, player_id, season):
    """``season`` may be a start year (``2025``) or an NBA key (``2025-26``)."""

    variants = season_lookup_variants(season)
    player_statistics = Statistic.objects.filter(player_id=player_id, season__in=variants).order_by(
        "season"
    )
    serializer = StatisticSerializer(player_statistics, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def team_standing_season(request, team_id, season):
    """``season`` may be a start year (``2025``) or an NBA key (``2025-26``)."""

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
    Optional ``name`` matches full, first, or last name; optional ``team`` matches
    franchise full name, nickname, or abbreviation. Both are case-insensitive.
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
    Top rows for ``season`` by ``stat_category`` (a key of ``STAT_LEADER_FIELDS``).
    Optional ``limit`` defaults to 10, max 100.

    The current campaign only counts active players; older seasons filter by
    career window instead (see ``_same_league_campaign_as_env``).
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
    """404 when either team has no standing for ``season``."""

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
    Career averages and per-season breakdown, limited to seasons within
    ``Player.year_start``..``Player.year_end``. 404 when that window has no stats.
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
    Active players assigned to the team with stats for ``SEASON``.
    Waived or inactive players are excluded even if they have ``SEASON`` stats.
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
    Players with a ``season`` stat line for this franchise. Uses ``Statistic.team``,
    not ``Player.team``, so traded players appear on the right roster. Waived or
    inactive players are included when that row exists.
    """

    tid = str(team_id)
    team = _team_optional(tid)
    season_key = str(season).strip()
    if not season_key:
        return Response({"error": "Season is required"}, status=400)

    variants = list(dict.fromkeys(season_lookup_variants(season_key)))
    league_y = resolve_season_start_year(season_key, variants)

    played_for_franchise = Statistic.objects.filter(
        player_id=OuterRef("player_id"),
        season__in=variants,
        team_id=tid,
    )
    players_qs = (
        Player.objects.filter(Exists(played_for_franchise))
        .select_related("team")
        .order_by("full_name")
    )
    
    players_qs = _players_active_in_league_year(players_qs, league_y)
    roster_scope = "stat_team_season"

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
    """Players currently assigned to the team, regardless of season."""

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
    """Standings for ``season`` by wins; the response label prefers ``2025-26`` over ``2025``."""

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


def _schedule_page_size(request):
    """``page_size`` wins over ``limit``, its older name."""

    raw = request.query_params.get("page_size", request.query_params.get("limit", 40))
    try:
        size = int(raw)
    except (TypeError, ValueError):
        return 40
    if size < 1:
        return 40
    return min(size, 200)


def _schedule_page_number(request):
    raw = request.query_params.get("page", 1)
    try:
        page = int(raw)
    except (TypeError, ValueError):
        return 1
    return page if page >= 1 else 1


@api_view(["GET"])
def game_detail(request, game_id):
    """One game: teams, score, status, tip time, and venue. No box score is stored."""

    game = get_object_or_404(
        Game.objects.select_related("home_team", "away_team"),
        game_id=game_id,
    )
    return Response(GameSerializer(game).data)


@api_view(["GET"])
def schedule_list(request):
    """
    Games for a season, latest first.

    Query params: ``season`` (default ``SEASON``), ``date`` (YYYY-MM-DD),
    ``from`` and ``to`` (inclusive YYYY-MM-DD bounds), ``team`` (id or
    abbreviation), ``order`` (``desc`` default, or ``asc``), ``page``
    (default 1), ``page_size`` (default 40, max 200; ``limit`` is an alias).
    """

    season = (request.query_params.get("season") or SEASON).strip()
    variants = season_lookup_variants(season)
    page_size = _schedule_page_size(request)
    page = _schedule_page_number(request)
    games = Game.objects.filter(season__in=variants).select_related("home_team", "away_team")

    team_ids = _schedule_team_ids(request.query_params.get("team"))
    if team_ids is not None:
        if not team_ids:
            return Response(
                {
                    "season": resolved_season_label(variants),
                    "games": [],
                    "count": 0,
                    "page": 1,
                    "page_size": page_size,
                }
            )
        games = games.filter(Q(home_team_id__in=team_ids) | Q(away_team_id__in=team_ids))

    try:
        game_day = _query_date(request, "date")
        start_date = _query_date(request, "from")
        end = _query_date(request, "to")
    except _BadDate as exc:
        return Response({"error": f"{exc.field} must be YYYY-MM-DD"}, status=400)
    if game_day is not None:
        games = games.filter(game_date=game_day)
    if start_date is not None:
        games = games.filter(game_date__gte=start_date)
    if end is not None:
        games = games.filter(game_date__lte=end)

    order = (request.query_params.get("order") or "desc").strip().lower()
    if order not in ("asc", "desc"):
        return Response({"error": "order must be asc or desc"}, status=400)
    if order == "asc":
        games = games.order_by("game_date", "game_id")
    else:
        games = games.order_by("-game_date", "-game_id")
    total = games.count()
    if total:
        last_page = (total + page_size - 1) // page_size
        page = min(page, last_page)
    else:
        page = 1
    start = (page - 1) * page_size
    selected = list(games[start : start + page_size])

    return Response(
        {
            "season": resolved_season_label(variants),
            "games": GameSerializer(selected, many=True).data,
            "count": total,
            "page": page,
            "page_size": page_size,
        }
    )
