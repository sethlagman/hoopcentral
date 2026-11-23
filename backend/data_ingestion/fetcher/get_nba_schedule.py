import json
import os
import sys
import time
from pathlib import Path

from dotenv import load_dotenv
from nba_api.stats.endpoints import scheduleleaguev2
from nba_api.stats.library.http import STATS_HEADERS

_INGEST = Path(__file__).resolve().parent.parent
if str(_INGEST) not in sys.path:
    sys.path.insert(0, str(_INGEST))

from log import get_logger
from validate import assert_schedule_payload

BASE_DIR = _INGEST
load_dotenv(BASE_DIR.parent.parent / '.env')
OUTPUT_DIR = BASE_DIR / 'output' / 'raw'
SEASON = os.environ.get('SEASON', '2025-26')
LOG = get_logger('hoopcentral.ingestion.schedule_fetch')

REQUEST_HEADERS = {**STATS_HEADERS, "Origin": "https://www.nba.com"}

MAX_RETRIES = 5
RETRY_BACKOFF_BASE = 1.0
RETRY_BACKOFF_FACTOR = 2.0


def get_nba_schedule(output_file=OUTPUT_DIR / 'nba_schedule_data.json', season=SEASON):
    """Fetch the league schedule for one season and save the raw JSON."""

    last_error = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            LOG.info("Fetching schedule for %s (attempt %s/%s)...", season, attempt, MAX_RETRIES)
            schedule = scheduleleaguev2.ScheduleLeagueV2(
                season=season,
                headers=REQUEST_HEADERS,
                timeout=60,
            )
            data = schedule.get_dict()
            assert_schedule_payload(data)
            break
        except Exception as e:
            last_error = e
            LOG.warning("Attempt %s/%s failed: %s. Retrying...", attempt, MAX_RETRIES, e)
            if attempt < MAX_RETRIES:
                delay = min(RETRY_BACKOFF_BASE * (RETRY_BACKOFF_FACTOR ** (attempt - 1)), 60)
                LOG.info("Waiting %.1fs before retry...", delay)
                time.sleep(delay)
    else:
        LOG.error("Error fetching schedule: %s", last_error)
        raise last_error

    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, 'w') as f:
        json.dump(data, f, indent=2)
    LOG.info("Successfully saved schedule to %s", output_file)
    return data


if __name__ == '__main__':
    get_nba_schedule()
