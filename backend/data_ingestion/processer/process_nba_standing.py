import json
import sys
from pathlib import Path

INGEST_ROOT = Path(__file__).resolve().parent.parent
if str(INGEST_ROOT) not in sys.path:
    sys.path.insert(0, str(INGEST_ROOT))

from common import canonical_season
from log import get_logger
from validate import InvalidPayload, column_positions, first_result_set, load_json, row_value

BASE_DIR = INGEST_ROOT
RAW_DIR = BASE_DIR / 'output' / 'raw'
PROCESSED_DIR = BASE_DIR / 'output' / 'processed'
LOG = get_logger('hoopcentral.ingestion.standing')

# Header names match nba_api LeagueStandingsV3. The index is the fallback.
STANDING_COLUMNS = {
    'id': ('TeamID', 2),
    'conference': ('Conference', 6),
    'conference_record': ('ConferenceRecord', 7),
    'division_record': ('DivisionRecord', 11),
    'wins': ('WINS', 13),
    'losses': ('LOSSES', 14),
    'winrate': ('WinPCT', 15),
    'home': ('HOME', 18),
    'road': ('ROAD', 19),
    'last10': ('L10', 20),
    'overtime': ('OT', 23),
    'winstreak': ('CurrentStreak', 36),
}


def _standing_rows(headers, rows):
    positions = column_positions(headers, STANDING_COLUMNS)
    by_id = {}
    order = []
    skipped = 0
    for row in rows:
        team_id = row_value(row, positions, 'id')
        wins = row_value(row, positions, 'wins')
        losses = row_value(row, positions, 'losses')
        winrate = row_value(row, positions, 'winrate')
        if team_id in (None, '') or wins is None or losses is None or winrate is None:
            skipped += 1
            continue
        team_id = str(team_id)
        item = {
            'id': team_id,
            'conference': row_value(row, positions, 'conference'),
            'conference_record': row_value(row, positions, 'conference_record'),
            'division_record': row_value(row, positions, 'division_record'),
            'wins': wins,
            'losses': losses,
            'winrate': winrate,
            'home': row_value(row, positions, 'home'),
            'road': row_value(row, positions, 'road'),
            'last10': row_value(row, positions, 'last10'),
            'overtime': row_value(row, positions, 'overtime'),
            'winstreak': row_value(row, positions, 'winstreak'),
        }
        if team_id not in by_id:
            order.append(team_id)
        by_id[team_id] = item
    return [by_id[team_id] for team_id in order], skipped


def process_nba_standing(raw_file=RAW_DIR / 'nba_standing_data.json', output_dir=None):
    standing_data = load_json(raw_file)
    if not isinstance(standing_data, dict):
        raise InvalidPayload('Standing payload must be a JSON object keyed by season')

    by_season = {}
    season_order = []
    skipped = 0
    for year, data in standing_data.items():
        label = canonical_season(year) or str(year).strip()
        if not label:
            skipped += 1
            continue
        try:
            headers, rows = first_result_set(data, f'standing {label}')
        except InvalidPayload as exc:
            LOG.warning('Skipping standing season %s: %s', label, exc)
            skipped += 1
            continue
        extracted, row_skipped = _standing_rows(headers, rows)
        skipped += row_skipped
        if label not in by_season:
            season_order.append(label)
            by_season[label] = {}
        for item in extracted:
            by_season[label][item['id']] = item

    standings = [{label: list(by_season[label].values())} for label in season_order]
    output_dir = Path(output_dir) if output_dir is not None else PROCESSED_DIR
    output_dir.mkdir(parents=True, exist_ok=True)
    with open(output_dir / 'nba_standing.json', 'w', encoding='utf-8') as handle:
        json.dump(standings, handle, indent=2)

    written = sum(len(by_season[label]) for label in season_order)
    LOG.info('Process NBA standing complete written=%s seasons=%s skipped=%s', written, len(season_order), skipped)
    return {'written': written, 'seasons': len(season_order), 'skipped': skipped}


if __name__ == '__main__':
    process_nba_standing()
