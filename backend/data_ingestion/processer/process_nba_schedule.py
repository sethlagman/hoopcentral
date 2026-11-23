import json
import os
import sys
from datetime import datetime
from pathlib import Path

from nba_api.stats.static import teams

INGEST_ROOT = Path(__file__).resolve().parent.parent
if str(INGEST_ROOT) not in sys.path:
    sys.path.insert(0, str(INGEST_ROOT))

from common import canonical_season
from log import get_logger
from validate import InvalidPayload, assert_schedule_payload, load_json

BASE_DIR = INGEST_ROOT
RAW_DIR = BASE_DIR / 'output' / 'raw'
PROCESSED_DIR = BASE_DIR / 'output' / 'processed'
LOG = get_logger('hoopcentral.ingestion.schedule')


def _season_label(season_year, requested_season):
    raw = str(requested_season).strip() if requested_season else str(season_year or '').strip()
    labeled = canonical_season(raw)
    if labeled:
        return labeled
    year_text = str(season_year or '')[:4]
    if year_text.isdigit():
        year = int(year_text)
        return f"{year}-{str(year + 1)[-2:]}"
    return raw


def _parse_date(value):
    text = str(value or '').strip()
    for fmt in ('%m/%d/%Y %H:%M:%S', '%m/%d/%Y', '%Y-%m-%d', '%Y-%m-%dT%H:%M:%S'):
        try:
            # gameDateEst looks like 2025-10-02T00:00:00Z; [:19] drops the trailing Z.
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


def nba_team_ids():
    return {str(team['id']) for team in teams.get_teams()}


def games_from_schedule(payload, season=None, team_ids=None):
    """
    Turn a ScheduleLeagueV2 response into a flat list of game dicts.

    Only games between two NBA franchises are kept. The schedule also lists
    All-Star events and preseason games against overseas clubs. A game with a
    missing id or an unreadable date is skipped; the rest of the schedule is kept.
    """

    if not isinstance(payload, dict):
        raise InvalidPayload('Schedule payload must be a JSON object')
    team_ids = nba_team_ids() if team_ids is None else {str(t) for t in team_ids}
    schedule = payload.get('leagueSchedule') or payload
    if not isinstance(schedule, dict):
        raise InvalidPayload('Schedule payload is missing leagueSchedule')
    season_label = _season_label(schedule.get('seasonYear'), season)
    games = []
    skipped = 0
    for game_date in schedule.get('gameDates') or []:
        if not isinstance(game_date, dict):
            skipped += 1
            continue
        for game in game_date.get('games') or []:
            if not isinstance(game, dict) or game.get('gameId') in (None, ''):
                skipped += 1
                continue
            home = game.get('homeTeam') or {}
            away = game.get('awayTeam') or {}
            if str(home.get('teamId')) not in team_ids or str(away.get('teamId')) not in team_ids:
                continue
            date_value = game.get('gameDateEst') or game_date.get('gameDate')
            try:
                game_day = _parse_date(date_value)
            except (TypeError, ValueError):
                skipped += 1
                LOG.warning('Skipping game %s: unrecognized date %r', game.get('gameId'), date_value)
                continue
            games.append(
                {
                    'game_id': str(game.get('gameId')),
                    'season': season_label,
                    'game_date': game_day,
                    # gameTimeEst uses a placeholder date, e.g. 1900-01-01T12:00:00Z.
                    'tip_time_est': str(game.get('gameTimeEst') or ''),
                    'status': game.get('gameStatus'),
                    'status_text': str(game.get('gameStatusText') or '').strip(),
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
    if skipped:
        LOG.info('Skipped %s schedule rows with missing ids or dates', skipped)
    return games


def process_nba_schedule(
    raw_file=RAW_DIR / 'nba_schedule_data.json',
    season=None,
    output_dir=None,
):
    season = season if season is not None else os.environ.get('SEASON', '2025-26')
    payload = load_json(raw_file)
    assert_schedule_payload(payload)

    games = games_from_schedule(payload, season=season)
    output_dir = Path(output_dir) if output_dir is not None else PROCESSED_DIR
    output_dir.mkdir(parents=True, exist_ok=True)
    output = output_dir / 'nba_schedule.json'
    with open(output, 'w', encoding='utf-8') as handle:
        json.dump(games, handle, indent=2)
    LOG.info('Process NBA schedule complete (%s games)', len(games))
    return games


if __name__ == '__main__':
    process_nba_schedule()
