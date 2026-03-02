from django.db import models

class Team(models.Model):
    team_id = models.CharField('Team ID', primary_key=True, max_length=50)
    full_name = models.CharField('Team full name', max_length=100, null=True)
    abbreviation = models.CharField('Team abbreviation', max_length=50, null=True)
    nickname = models.CharField('Team nickname', max_length=50, null=True)
    city = models.CharField('Team city', max_length=50, null=True)
    state = models.CharField('Team state', max_length=50, null=True)
    year_founded = models.IntegerField('Team year founded', null=True)
    logo = models.URLField('Team Logo', null=True)

    def __str__(self):
        return self.full_name


class Player(models.Model):
    player_id = models.CharField('Player ID', primary_key=True, max_length=50)
    full_name = models.CharField('Player full name', max_length=100)
    last_name = models.CharField('Player last name', max_length=50)
    first_name = models.CharField('Player first name', max_length=50)
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='players')
    jersey = models.CharField('Player jersey number', null=True, max_length=10)
    is_active = models.BooleanField('Player currently playing')
    headshot = models.URLField('Player image')
    year_start = models.CharField('Player starting year', max_length=50)
    year_end = models.CharField('Player last year', max_length=50)

    def __str__(self):
        return self.full_name


class Statistic(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='statistics')
    season = models.CharField('Season statistic', max_length=30)
    ppg = models.DecimalField('Points per game', max_digits=5, decimal_places=1, null=True)
    rpg = models.DecimalField('Rebounds per game', max_digits=5, decimal_places=1, null=True)
    apg = models.DecimalField('Assists per game', max_digits=5, decimal_places=1, null=True)


class Standing(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='standings')
    season = models.CharField('Season statistic', max_length=30)
    conference = models.CharField('Team conference', max_length=20)
    conference_record = models.CharField('Team conference record', max_length=20)
    division_record = models.CharField('Team division record', max_length=20)
    wins = models.IntegerField('Team wins')
    losses = models.IntegerField('Team losses')
    winrate = models.DecimalField('Team win rate', max_digits=5, decimal_places=3)
    home = models.CharField('Team Home Record', max_length=20)
    road = models.CharField('Team Road Record', max_length=20)
    last10 = models.CharField('Team Last 10 Games Standing', max_length=20, null=True)
    overtime = models.CharField('Team Overtime Count', max_length=20)
    winstreak = models.CharField('Team win streak', max_length=20, null=True)
