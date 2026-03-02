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
    
    class Meta:
        model = Standing
        fields = '__all__'
