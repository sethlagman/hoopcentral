import json
import sys
from pathlib import Path

INGEST_ROOT = Path(__file__).resolve().parent.parent
if str(INGEST_ROOT) not in sys.path:
    sys.path.insert(0, str(INGEST_ROOT))

from log import get_logger
from validate import InvalidPayload, load_json

BASE_DIR = INGEST_ROOT
RAW_DIR = BASE_DIR / 'output' / 'raw'
PROCESSED_DIR = BASE_DIR / 'output' / 'processed'
LOG = get_logger('hoopcentral.ingestion.team')


def get_nba_team_image_url(team_id: str) -> str:
    return f'https://cdn.nba.com/logos/nba/{team_id}/primary/L/logo.svg'


def process_nba_team(raw_file=RAW_DIR / 'nba_team_data.json', output_dir=None):
    team_data = load_json(raw_file)
    if not isinstance(team_data, list):
        raise InvalidPayload('NBA team payload must be a JSON array')

    cleaned = []
    skipped = 0
    seen = set()
    for team in team_data:
        if not isinstance(team, dict) or team.get('id') in (None, ''):
            skipped += 1
            continue
        team_id = str(team['id'])
        if team_id in seen:
            skipped += 1
            continue
        seen.add(team_id)
        row = dict(team)
        row['id'] = team_id
        row['logo'] = get_nba_team_image_url(team_id)
        cleaned.append(row)

    output_dir = Path(output_dir) if output_dir is not None else PROCESSED_DIR
    output_dir.mkdir(parents=True, exist_ok=True)
    with open(output_dir / 'nba_team.json', 'w', encoding='utf-8') as handle:
        json.dump(cleaned, handle, indent=2)

    LOG.info('Process NBA team complete written=%s skipped=%s', len(cleaned), skipped)
    return {'written': len(cleaned), 'skipped': skipped}


if __name__ == '__main__':
    process_nba_team()
