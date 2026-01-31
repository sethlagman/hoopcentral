from django.urls import include, path
from rest_framework import routers

from .views import (player_list, team_list, standing_list,
                    statistic_list, player_id, team_id,
                    player_statistic, team_standing, player_statistic_season,
                    team_standing_season
                    )

urlpatterns = [
    path('player/', player_list, name='player'),
    path('team/', team_list, name='team'),
    path('standing/', standing_list, name='standing'),
    path('statistic/', statistic_list, name='statistic'),
    path('player/<int:player_id>', player_id, name='player_id'),
    path('team/<int:team_id>', team_id, name='team_id'),
    path('statistic/<int:player_id>', player_statistic, name='player_statistic'),
    path('standing/<int:team_id>', team_standing, name='team_standing'),
    path('statistic/<int:player_id>/<str:season>', player_statistic_season, name='player_statistic_season'),
    path('standing/<int:team_id>/<str:season>', team_standing_season, name='team_standing_season'),
]
