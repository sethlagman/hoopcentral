from django.urls import path

from .views import (
    player_career_summary,
    player_id,
    player_list,
    player_search,
    player_statistic,
    player_statistic_season,
    season_summary,
    standing_list,
    stat_leaders,
    statistic_list,
    team_compare,
    team_id,
    team_list,
    team_roster,
    team_standing,
    team_standing_season,
)

urlpatterns = [
    # Base collections
    path("player", player_list, name="player"),
    path("team", team_list, name="team"),
    path("standing", standing_list, name="standing"),
    path("statistic", statistic_list, name="statistic"),

    # IDs and detail
    path("player/<int:player_id>", player_id, name="player_id"),
    path("team/<int:team_id>", team_id, name="team_id"),
    path("statistic/<int:player_id>", player_statistic, name="player_statistic"),
    path("standing/<int:team_id>", team_standing, name="team_standing"),
    path(
        "statistic/<int:player_id>/<str:season>",
        player_statistic_season,
        name="player_statistic_season",
    ),
    path(
        "standing/<int:team_id>/<str:season>",
        team_standing_season,
        name="team_standing_season",
    ),

    # Search and leaders
    path("player/search/", player_search, name="player_search"),
    path(
        "leaders/<str:season>/<str:stat_category>",
        stat_leaders,
        name="stat_leaders",
    ),
    
    # Comparison and summary
    path(
        "team/compare/<int:team_id_1>/<int:team_id_2>/<str:season>",
        team_compare,
        name="team_compare",
    ),
    path(
        "player/<int:player_id>/career-summary",
        player_career_summary,
        name="player_career_summary",
    ),
    path("team/<int:team_id>/roster", team_roster, name="team_roster"),
    path("season/<str:season>/summary", season_summary, name="season_summary"),
]
