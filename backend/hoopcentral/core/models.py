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
    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name='season_statistics',
        null=True,
        blank=True,
        help_text='Franchise this stat line was accumulated for (NBA season team).',
    )
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


class Game(models.Model):
    game_id = models.CharField('Game ID', primary_key=True, max_length=20)
    season = models.CharField('Season', max_length=30)
    game_date = models.DateField('Game date')
    tip_time_est = models.CharField('Tip time (ET)', max_length=40, blank=True)
    status = models.IntegerField('Game status code', null=True, blank=True)
    status_text = models.CharField('Game status text', max_length=40, blank=True)
    arena_name = models.CharField('Arena', max_length=120, blank=True)
    arena_city = models.CharField('Arena city', max_length=80, blank=True)
    home_team = models.ForeignKey(
        Team, on_delete=models.CASCADE, related_name='home_games'
    )
    away_team = models.ForeignKey(
        Team, on_delete=models.CASCADE, related_name='away_games'
    )
    home_score = models.IntegerField('Home score', null=True, blank=True)
    away_score = models.IntegerField('Away score', null=True, blank=True)

    class Meta:
        ordering = ['game_date', 'tip_time_est', 'game_id']

    def __str__(self):
        return f'{self.away_team_id} at {self.home_team_id} ({self.game_date})'
