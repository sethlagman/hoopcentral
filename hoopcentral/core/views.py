from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Player, Team, Statistic, Standing
from .serializers import PlayerSerializer, TeamSerializer, StatisticSerializer, StandingSerializer
from django.shortcuts import get_object_or_404

@api_view(['GET'])
def player_list(request):
    """Returns all players"""

    player = Player.objects.all()
    serializer = PlayerSerializer(player, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def team_list(request):
    """Returns all teams"""

    team = Team.objects.all()
    serializer = TeamSerializer(team, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def statistic_list(request):
    """Returns all player statistics"""

    statistic = Statistic.objects.all()
    serializer = StatisticSerializer(statistic, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def standing_list(request):
    """Returns all team standings"""

    standing = Standing.objects.all()
    serializer = StandingSerializer(standing, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def player_id(request, player_id):
    """Return a player"""

    player = get_object_or_404(Player, player_id=player_id)
    serializer = PlayerSerializer(player)
    return Response(serializer.data)


@api_view(['GET'])
def team_id(request, team_id):
    """Return a team"""

    team = get_object_or_404(Team, team_id=team_id)
    serializer = TeamSerializer(team)
    return Response(serializer.data)


@api_view(['GET'])
def player_statistic(request, player_id):
    """Return a player statistic"""

    player_statistic = Statistic.objects.filter(player_id=player_id)
    serializer = StatisticSerializer(player_statistic, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def team_standing(request, team_id):
    """Return a team standing"""

    team_standing = Standing.objects.filter(team_id=team_id)
    serializer = StandingSerializer(team_standing, many=True)
    return Response(serializer.data)
