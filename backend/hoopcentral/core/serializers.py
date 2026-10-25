from rest_framework import serializers
from .models import Game, Player, Team, Statistic, Standing

class PlayerSerializer(serializers.ModelSerializer):

    team_name = serializers.CharField(source='team.full_name', read_only=True, allow_null=True)

    class Meta:
        model = Player
        fields = (
            'player_id',
            'full_name',
            'last_name',
            'first_name',
            'team',
            'team_name',
            'jersey',
            'is_active',
            'headshot',
            'year_start',
            'year_end',
        )


class TeamSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Team
        fields = '__all__'


class StatisticSerializer(serializers.ModelSerializer):
    player_name = serializers.CharField(source="player.full_name", read_only=True)

    class Meta:
        model = Statistic
        fields = (
            "id",
            "player",
            "player_name",
            "season",
            "ppg",
            "rpg",
            "apg",
        )


class StandingSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(source="team.full_name", read_only=True)

    class Meta:
        model = Standing
        fields = (
            "id",
            "team",
            "team_name",
            "season",
            "conference",
            "conference_record",
            "division_record",
            "wins",
            "losses",
            "winrate",
            "home",
            "road",
            "last10",
            "overtime",
            "winstreak",
        )


class GameSerializer(serializers.ModelSerializer):
    home_team_name = serializers.CharField(source="home_team.full_name", read_only=True)
    away_team_name = serializers.CharField(source="away_team.full_name", read_only=True)
    home_tricode = serializers.CharField(source="home_team.abbreviation", read_only=True)
    away_tricode = serializers.CharField(source="away_team.abbreviation", read_only=True)

    class Meta:
        model = Game
        fields = (
            "game_id",
            "season",
            "game_date",
            "tip_time_est",
            "status",
            "status_text",
            "arena_name",
            "arena_city",
            "home_team",
            "home_team_name",
            "home_tricode",
            "home_score",
            "away_team",
            "away_team_name",
            "away_tricode",
            "away_score",
        )
