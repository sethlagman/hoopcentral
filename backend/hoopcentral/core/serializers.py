from rest_framework import serializers
from .models import Player, Team, Statistic, Standing

class PlayerSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Player
        fields = '__all__'


class TeamSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Team
        fields = '__all__'


class StatisticSerializer(serializers.ModelSerializer):
    class Meta:
        model = Statistic
        fields = '__all__'


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
