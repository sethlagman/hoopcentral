import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

INGEST_ROOT = Path(__file__).resolve().parent.parent
if str(INGEST_ROOT) not in sys.path:
    sys.path.insert(0, str(INGEST_ROOT))

from common import canonical_season
from log import get_logger
from validate import InvalidPayload, column_positions, first_result_set, load_json, row_value

BASE_DIR = INGEST_ROOT
SEASON = (os.environ.get('SEASON') or '2025-26').strip()
RAW_DIR = BASE_DIR / 'output' / 'raw'
PROCESSED_DIR = BASE_DIR / 'output' / 'processed'
PLAYER_HEADSHOTS = 'https://cdn.nba.com/headshots/nba/latest/1040x760/'
LOG = get_logger('hoopcentral.ingestion.player')

# Header names match nba_api PlayerIndex. The index is the fallback when headers are absent.
STAT_COLUMNS = {
    'id': ('PERSON_ID', 0),
    'team_id': ('TEAM_ID', 4),
    'ppg': ('PTS', 20),
    'rpg': ('REB', 21),
    'apg': ('AST', 22),
}
PROFILE_COLUMNS = {
    'id': ('PERSON_ID', 0),
    'last_name': ('PLAYER_LAST_NAME', 1),
    'first_name': ('PLAYER_FIRST_NAME', 2),
    'team_id': ('TEAM_ID', 4),
    'jersey': ('JERSEY_NUMBER', 10),
    'roster_status': ('ROSTER_STATUS', 19),
    'year_start': ('FROM_YEAR', 24),
    'year_end': ('TO_YEAR', 25),
}

load_dotenv(BASE_DIR.parent.parent / '.env')


def get_nba_player_image_url(player_id: str, url: str = PLAYER_HEADSHOTS) -> str:
    return f'{url}{player_id}.png'


def _text_id(value):
    if value in (None, ''):
        return None
    return str(value)


def _stat_rows(headers, rows):
    positions = column_positions(headers, STAT_COLUMNS)
    by_id = {}
    order = []
    skipped = 0
    for row in rows:
        player_id = _text_id(row_value(row, positions, 'id'))
        ppg = row_value(row, positions, 'ppg')
        rpg = row_value(row, positions, 'rpg')
        apg = row_value(row, positions, 'apg')
        if player_id is None or (ppg is None and rpg is None and apg is None):
            skipped += 1
            continue
        item = {
            'id': player_id,
            'team_id': _text_id(row_value(row, positions, 'team_id')),
            'ppg': ppg,
            'rpg': rpg,
            'apg': apg,
        }
        if player_id not in by_id:
            order.append(player_id)
        by_id[player_id] = item
    return [by_id[player_id] for player_id in order], skipped


def _profile_rows(headers, rows):
    positions = column_positions(headers, PROFILE_COLUMNS)
    by_id = {}
    order = []
    skipped = 0
    for row in rows:
        player_id = _text_id(row_value(row, positions, 'id'))
        team_id = _text_id(row_value(row, positions, 'team_id'))
        first_name = row_value(row, positions, 'first_name')
        last_name = row_value(row, positions, 'last_name')
        full_name = f'{first_name or ""} {last_name or ""}'.strip()
        if player_id is None or team_id is None or not full_name:
            skipped += 1
            continue
        roster_status = row_value(row, positions, 'roster_status')
        item = {
            'id': player_id,
            'full_name': full_name,
            'last_name': '' if last_name is None else str(last_name),
            'first_name': '' if first_name is None else str(first_name),
            'team_id': team_id,
            'jersey': row_value(row, positions, 'jersey'),
            # ROSTER_STATUS is 1 for players on a current roster and null otherwise.
            'is_active': 'true' if roster_status is not None else 'false',
            'headshot': get_nba_player_image_url(player_id=player_id),
            'year_start': row_value(row, positions, 'year_start'),
            'year_end': row_value(row, positions, 'year_end'),
        }
        if player_id not in by_id:
            order.append(player_id)
        by_id[player_id] = item
    return [by_id[player_id] for player_id in order], skipped


def process_nba_player(raw_file=RAW_DIR / 'nba_player_data.json', output_dir=None):
    player_data = load_json(raw_file)
    if not isinstance(player_data, dict):
        raise InvalidPayload('Player payload must be a JSON object keyed by season')

    stats_by_season = {}
    season_order = []
    season_rows = {}
    skipped = 0
    for year, data in player_data.items():
        label = canonical_season(year) or str(year).strip()
        if not label:
            skipped += 1
            continue
        try:
            headers, rows = first_result_set(data, f'player {label}')
        except InvalidPayload as exc:
            LOG.warning('Skipping player season %s: %s', label, exc)
            skipped += 1
            continue
        extracted, row_skipped = _stat_rows(headers, rows)
        skipped += row_skipped
        season_rows[label] = (headers, rows)
        if label not in stats_by_season:
            season_order.append(label)
            stats_by_season[label] = {}
        for item in extracted:
            stats_by_season[label][item['id']] = item

    profile_key = canonical_season(SEASON) or SEASON
    if profile_key not in season_rows and season_order:
        profile_key = season_order[-1]
    players = []
    if profile_key in season_rows:
        headers, rows = season_rows[profile_key]
        players, profile_skipped = _profile_rows(headers, rows)
        skipped += profile_skipped

    total_statistics = [
        {label: list(stats_by_season[label].values())}
        for label in season_order
    ]

    output_dir = Path(output_dir) if output_dir is not None else PROCESSED_DIR
    output_dir.mkdir(parents=True, exist_ok=True)
    with open(output_dir / 'nba_player.json', 'w', encoding='utf-8') as handle:
        json.dump(players, handle, indent=2)
    with open(output_dir / 'nba_statistic.json', 'w', encoding='utf-8') as handle:
        json.dump(total_statistics, handle, indent=2)

    LOG.info(
        'Process NBA player complete players=%s seasons=%s skipped=%s',
        len(players),
        len(season_order),
        skipped,
    )
    return {'players': len(players), 'seasons': len(season_order), 'skipped': skipped}


if __name__ == '__main__':
    process_nba_player()
