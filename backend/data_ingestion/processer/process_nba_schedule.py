import json
import os
from datetime import datetime
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
RAW_DIR = BASE_DIR / 'output' / 'raw'
PROCESSED_DIR = BASE_DIR / 'output' / 'processed'


def _season_label(season_year, requested_season):
    if requested_season:
        return str(requested_season).strip()
    year = int(str(season_year)[:4])
    return f"{year}-{str(year + 1)[-2:]}"


def _parse_date(value):
    text = str(value or '').strip()
    for fmt in ('%m/%d/%Y %H:%M:%S', '%m/%d/%Y', '%Y-%m-%d', '%Y-%m-%dT%H:%M:%S'):
        try:
            return datetime.strptime(text[:19], fmt).date().isoformat()
        except ValueError:
            continue
    if len(text) >= 10 and text[4] == '-':
        return text[:10]
    raise ValueError(f'Unrecognized game date: {value}')


def _score(value):
    if value is None or value == '':
        return None
    return int(value)


def games_from_schedule(payload, season=None):
    """Turn a ScheduleLeagueV2 response into a flat list of game dicts."""

    schedule = payload.get('leagueSchedule') or payload
    season_label = _season_label(schedule.get('seasonYear'), season)
    games = []
    for game_date in schedule.get('gameDates') or []:
        for game in game_date.get('games') or []:
            home = game.get('homeTeam') or {}
            away = game.get('awayTeam') or {}
            date_value = game.get('gameDateEst') or game_date.get('gameDate')
            games.append(
                {
                    'game_id': str(game.get('gameId')),
                    'season': season_label,
                    'game_date': _parse_date(date_value),
                    'tip_time_est': str(game.get('gameTimeEst') or ''),
                    'status': game.get('gameStatus'),
                    'status_text': str(game.get('gameStatusText') or ''),
                    'arena_name': str(game.get('arenaName') or ''),
                    'arena_city': str(game.get('arenaCity') or ''),
                    'home_team_id': str(home.get('teamId')),
                    'home_team_name': f"{home.get('teamCity', '')} {home.get('teamName', '')}".strip(),
                    'home_tricode': str(home.get('teamTricode') or ''),
                    'home_score': _score(home.get('score')),
                    'away_team_id': str(away.get('teamId')),
                    'away_team_name': f"{away.get('teamCity', '')} {away.get('teamName', '')}".strip(),
                    'away_tricode': str(away.get('teamTricode') or ''),
                    'away_score': _score(away.get('score')),
                }
            )
    return games


def process_nba_schedule(
    raw_file=RAW_DIR / 'nba_schedule_data.json',
    season=None,
):
    season = season if season is not None else os.environ.get('SEASON', '2025-26')
    with open(raw_file, 'r') as f:
        payload = json.load(f)

    games = games_from_schedule(payload, season=season)
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    output = PROCESSED_DIR / 'nba_schedule.json'
    with open(output, 'w') as f:
        json.dump(games, f, indent=2)
    print(f'Process NBA schedule complete ({len(games)} games)')
    return games


if __name__ == '__main__':
    process_nba_schedule()
