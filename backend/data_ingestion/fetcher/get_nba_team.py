import json
import sys
import time
from pathlib import Path

from nba_api.stats.static import teams

_INGEST = Path(__file__).resolve().parent.parent
if str(_INGEST) not in sys.path:
    sys.path.insert(0, str(_INGEST))

from log import get_logger
from validate import assert_team_list

BASE_DIR = _INGEST
OUTPUT_DIR = BASE_DIR / 'output' / 'raw'
LOG = get_logger('hoopcentral.ingestion.team_fetch')

MAX_RETRIES = 5
RETRY_BACKOFF_BASE = 1.0
RETRY_BACKOFF_FACTOR = 2.0


def get_nba_team(output_file=OUTPUT_DIR / 'nba_team_data.json'):
    """Save the static team list from ``nba_api``, retrying with exponential backoff."""

    last_error = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            LOG.info("Fetching team data (attempt %s/%s)...", attempt, MAX_RETRIES)
            data = teams.get_teams()
            assert_team_list(data)
            break
        except Exception as e:
            last_error = e
            LOG.warning("Attempt %s/%s failed: %s. Retrying...", attempt, MAX_RETRIES, e)
            if attempt < MAX_RETRIES:
                delay = min(RETRY_BACKOFF_BASE * (RETRY_BACKOFF_FACTOR ** (attempt - 1)), 60)
                LOG.info("Waiting %.1fs before retry...", delay)
                time.sleep(delay)
    else:
        LOG.error("Error fetching team data: %s", last_error)
        raise last_error

    output_file.parent.mkdir(parents=True, exist_ok=True)

    try:
        with open(output_file, 'w') as f:
            json.dump(data, f, indent=2)
        LOG.info("Successfully downloaded and saved to %s", output_file)
    except Exception as e:
        LOG.error("Unexpected error writing file: %s", e)
        raise


if __name__ == '__main__':
    get_nba_team()
